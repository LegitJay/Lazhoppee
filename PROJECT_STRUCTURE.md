# LazyHoppee - Angular Project Structure

## Overview
Angular web application with product and cart management modules.

## Complete Folder & File Structure

```
lazhoppee/
├── angular.json                 # Angular CLI configuration
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # TypeScript app-specific config
├── tsconfig.spec.json           # TypeScript test configuration
├── README.md                     # Project documentation
│
├── src/
│   ├── index.html               # Main HTML entry point
│   ├── main.ts                  # Bootstrap application
│   ├── styles.css               # Global styles
│   │
│   ├── app/                     # Application root module
│   │   ├── app.module.ts        # Root module declaration
│   │   ├── app.component.ts     # Root component class
│   │   ├── app.component.html   # Root component template
│   │   ├── app.component.css    # Root component styles
│   │   ├── app.component.spec.ts # Root component tests
│   │   ├── app-routing.module.ts # Application routing configuration
│   │   │
│   │   ├── product/             # Product feature module
│   │   │   ├── product.module.ts        # Product module declaration
│   │   │   ├── product.service.ts       # Product data service
│   │   │   ├── product.service.spec.ts  # Product service tests
│   │   │   └── product-list/            # Product list component
│   │   │       ├── product-list.component.ts
│   │   │       ├── product-list.component.html
│   │   │       ├── product-list.component.css
│   │   │       └── product-list.component.spec.ts
│   │   │
│   │   ├── cart/                # Cart feature module
│   │   │   ├── cart.module.ts           # Cart module declaration
│   │   │   ├── cart.service.ts          # Cart data service
│   │   │   ├── cart.service.spec.ts     # Cart service tests
│   │   │   └── cart-list/               # Cart list component
│   │   │       ├── cart-list.component.ts
│   │   │       ├── cart-list.component.html
│   │   │       ├── cart-list.component.css
│   │   │       └── cart-list.component.spec.ts
│   │   │
│   │   └── models/              # Shared data models
│   │       ├── product.ts       # Product model/interface
│   │       └── product.spec.ts  # Product model tests
│   │
│   ├── assets/                  # Static assets
│   │   └── images/              # Image assets
│   │       └── helmets/         # Helmet images (product images)
│   │
│   └── environments/            # Environment configurations
│       ├── environment.ts       # Production environment
│       └── environment.development.ts # Development environment
```

## Key Files Summary

| File | Purpose |
|------|---------|
| `app.module.ts` | Main application module with imports and declarations |
| `app-routing.module.ts` | Routing configuration for navigation |
| `product.service.ts` | Service for product data management |
| `cart.service.ts` | Service for cart operations |
| `product.model.ts` | Product data interface/model |
| `main.ts` | Application bootstrap entry point |

## Features
- **Product Module**: Display and manage products
- **Cart Module**: Shopping cart functionality
- **Routing**: Client-side navigation between modules
- **Services**: Data management via services
- **Models**: Type-safe data structures

## Technology Stack
- **Framework**: Angular
- **Language**: TypeScript
- **Styling**: CSS
- **Testing**: Jasmine (spec files included)
- **Build Tool**: Angular CLI
