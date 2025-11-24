/**
 * Comprehensive Real-World Example
 * This example demonstrates a complete OpenScript application setup,
 * mirroring patterns used in the Carata codebase.
 */

import {
    Component,
    Mediator,
    h,
    state,
    broker,
    router,
    context,
    putContext,
    payload,
    Utils
} from "../index.js";

// ============================================
// 1. EVENT REGISTRATION
// ============================================
// Define all application events in a structured object
const $e = {
    system: {
        booted: true,
        needs: {
            reload: true,
        }
    },
    user: {
        authenticated: true,
        loggedOut: true,
        needs: {
            login: true,
            logout: true,
            profile: true,
        },
        has: {
            loginError: true,
        }
    },
    cart: {
        itemAdded: true,
        needs: {
            addition: true,
            removal: true,
            allItems: true,
        },
        has: {
            items: true,
        }
    }
};

// Register all events with the broker
broker.registerEvents($e);

// ============================================
// 2. CONTEXT INITIALIZATION
// ============================================
// Create application contexts
putContext(["global", "user", "page"], "AppContext");

const gc = context("global");  // Global context
const uc = context("user");    // User context
const pc = context("page");    // Page context

// Initialize states in contexts
gc.states({
    auth: false,
    appName: "MyApp",
});

uc.states({
    cart: {},
    profile: null,
    isLoggedIn: false,
});

pc.states({
    currentPage: "Home",
    loading: false,
});

// Add state listeners
uc.cart.listener((cartState) => {
    console.log(`Cart updated: ${Object.keys(cartState.value).length} items`);
});

// ============================================
// 3. MEDIATOR - BUSINESS LOGIC
// ============================================
class CartMediator extends Mediator {
    // Listen to multiple events with underscore separation
    $$cart = {
        needs: {
            // Single event listener
            addition: (ed, event) => {
                this.addToCart(ed, event);
            },
            
            removal: (ed, event) => {
                this.removeFromCart(ed, event);
            },
            
            allItems: () => {
                this.fetchCart();
            }
        }
    };

    // Multi-event listener - triggers on user:authenticated OR user:loggedOut
    $$user = {
        authenticated_loggedOut: (ed, event) => {
            console.log(`User status changed: ${event}`);
            this.broadcast($e.cart.needs.allItems);
        }
    };

    async addToCart(ed, event) {
        const data = Utils.parsePayload(ed);
        const product = data.message.product;
        
        // Simulate API call
        console.log(`Adding ${product.name} to cart`);
        
        // Update cart in context
        const currentCart = {...uc.cart.value};
        currentCart[product.id] = product;
        uc.cart.value = currentCart;
        
        // Broadcast success
        this.send($e.cart.itemAdded, payload({ product }));
    }

    async removeFromCart(ed, event) {
        const data = Utils.parsePayload(ed);
        const cartMap = uc.cart.value;
        delete cartMap[data.message.productId];
        uc.cart.value = {...cartMap};
    }

    async fetchCart() {
        // Simulate fetching cart from API
        console.log("Fetching cart items...");
    }
}

// ============================================
// 4. COMPONENT - COUNT BUTTON
// ============================================
class CounterButton extends Component {
    count = state(0);

    // Component method with $_ prefix
    $_increment() {
        this.count.value++;
    }

    render(...args) {
        return h.div(
            { class: "counter-section" },
            h.p(`Count: ${this.count.value}`),
            h.button(
                {
                    class: "btn btn-primary",
                    onclick: this.$_increment
                },
                "Increment"
            ),
            ...args
        );
    }
}

// ============================================
// 5. COMPONENT - PRODUCT CARD
// ============================================
class ProductCard extends Component {
    // Using h.func to create inline event handlers
    render(product, ...args) {
        return h.div(
            { class: "card" },
            h.div(
                { class: "card-body" },
                h.h5({ class: "card-title" }, product.name),
                h.p({ class: "card-text" }, `$${product.price}`),
                h.button(
                    {
                        class: "btn btn-success",
                        // h.func creates a callable string for inline handlers
                        onclick: h.func(
                            "broker.send",
                            $e.cart.needs.addition,
                            payload({ product })
                        )
                    },
                    "Add to Cart"
                )
            ),
            ...args
        );
    }
}

// ============================================
// 6. COMPONENT - SHOPPING CART
// ============================================
class ShoppingCart extends Component {
    render(...args) {
        return h.div(
            { class: "cart-container" },
            h.h3("Shopping Cart"),
            // Using v() for reactive rendering based on state
            h.div(
                h.p("Items in cart:"),
                h.ul(
                    // Reactive rendering - automatically updates when uc.cart changes
                    ...Object.values(uc.cart.value).map(product =>
                        h.li(
                            product.name,
                            " - ",
                            h.button(
                                {
                                    class: "btn btn-sm btn-danger",
                                    onclick: h.func(
                                        "broker.send",
                                        $e.cart.needs.removal,
                                        payload({ productId: product.id })
                                    )
                                },
                                "Remove"
                            )
                        )
                    )
                )
            ),
            ...args
        );
    }
}

// ============================================
// 7. COMPONENT - DASHBOARD (Parent Component)
// ============================================
class Dashboard extends Component {
    render(...args) {
        const sampleProducts = [
            { id: 1, name: "Widget", price: 9.99 },
            { id: 2, name: "Gadget", price: 19.99 },
            { id: 3, name: "Doohickey", price: 14.99 }
        ];

        return h.div(
            { class: "container mt-4" },
            h.div(
                { class: "row" },
                h.div(
                    { class: "col-md-8" },
                    h.h2("Products"),
                    h.div(
                        { class: "row" },
                        ...sampleProducts.map(product =>
                            h.div(
                                { class: "col-md-4 mb-3" },
                                h.ProductCard(product)
                            )
                        )
                    )
                ),
                h.div(
                    { class: "col-md-4" },
                    // Render counter button
                    h.CounterButton(),
                    h.hr(),
                    // Render shopping cart
                    h.ShoppingCart(),
                    // Listen to ProductCard's 'rendered' event
                    h.on(ProductCard, "rendered", () => {
                        console.log("Product card rendered");
                    })
                )
            ),
            ...args
        );
    }
}

// ============================================
// 8. INITIALIZATION
// ============================================
function initializeApp() {
    // Initialize mediator
    const cartMediator = new CartMediator();
    
    // Mount the dashboard component to DOM
    const root = document.getElementById("app");
    if (root) {
        const dashboard = new Dashboard();
        dashboard.mount(root);
        
        // Broadcast system booted event
        broker.broadcast($e.system.booted);
    }
}

// ============================================
// 9. ROUTE SETUP
// ============================================
// Routes use a fluent API with .on(), .prefix(), and .group()
router.on("/", () => {
    pc.currentPage.value = "Home";
}, "home");

router.prefix("products").group(() => {
    router.on("/{productId}/view", () => {
        pc.currentPage.value = "Product Details";
        // Access params via router.params.productId
    }, "product.view");
});

// Start listening to route changes
router.listen();

// Export for use
export { 
    Dashboard, 
    ProductCard, 
    ShoppingCart, 
    CounterButton,
    CartMediator,
    initializeApp 
};
