# E-Commerce REST API

## Project Overview
This project is a scalable and maintainable REST API built for an e-commerce platform. It provides functionality for user registration, authentication, product management, order processing, cart handling, and coupon management. The API uses JWT-based authentication and role-based access control (user and admin roles) to secure routes.

### Technologies Used
- **Node.js** and **Express**: For building the REST API server.
- **PostgreSQL**: The database to store user data, products, orders, etc.
- **Swagger**: For documenting the API endpoints.
- **Jest**: For Test-Driven Development (TDD) and ensuring code quality.
- **Passport.js**: For authentication strategies.
- **JWT**: Token-based authentication system.

## Architecture
The API follows the **MVC (Model-View-Controller)** pattern, ensuring separation of concerns and modularity.

### Folder Structure
- **Models**: Defines how data is structured in the database.
- **Controllers**: Handles HTTP requests and sends responses.
- **Services**: Contains the business logic, connecting the models and controllers.
- **Routes**: Maps routes to controllers and middleware.
- **Middlewares**: Includes JWT verification, error handling, and request validation.
- **Utils**: Contains reusable utility functions, validators, and custom error classes.

### Centralized Error Handling
- **Custom Error Classes**: `ValidationError`, `NotFoundError`, `DatabaseError`, and `UnauthorizedError`.
- **Error Middleware**: Catches and handles errors across the entire application, providing consistent and informative error responses.

## Authentication
- **JWT-based Authentication**: 
  - User login and registration endpoints are protected via JWT tokens.
  - The API uses **refresh tokens** for long-lived sessions, allowing users to get new access tokens without re-login.
- **Role-based Access Control**: Admin-specific routes are protected by middleware that checks the user's role.

### Authentication Endpoints:
- **POST /register**: User registration.
- **POST /login**: User login and token generation.
- **POST /refresh-token**: Refresh the JWT when it expires.

## Feature Modules

### Users and Profiles
Users can register, login, view, and update their profile information, including adding multiple shipping addresses.

- **POST /register**: Register a new user.
- **POST /login**: Login and generate JWT tokens.
- **GET /profile**: View the logged-in user's profile.
- **PUT /profile**: Update user profile.
- **POST /shipping-addresses**: Add a new shipping address.
- **GET /shipping-addresses**: View all shipping addresses.
- **PUT /shipping-addresses/:id**: Update a specific shipping address.
- **DELETE /shipping-addresses/:id**: Delete a shipping address.

### Products
Users and admins can view products, while only admins can create, update, or delete products. Pagination and filtering are supported for better user experience.

- **GET /products**: Get a paginated list of all products with optional filters for search and category.
- **GET /products/:id**: Get a specific product by ID.
- **POST /products**: Admins can create a new product.
- **PUT /products/:id**: Admins can update an existing product.
- **DELETE /products/:id**: Admins can delete a product.

### Categories
Admins can manage categories, which are associated with products. The following CRUD operations are available:

- **POST /categories**: Admins can create a new category.
- **GET /categories**: View all categories.
- **GET /categories/:id**: View a specific category.
- **PUT /categories/:id**: Admins can update a category.
- **DELETE /categories/:id**: Admins can delete a category.

### Cart and Orders
Users can manage their cart, add or remove items, and proceed to checkout to place an order. Coupons can be applied during checkout.

#### Cart Endpoints:
- **POST /cart**: Add an item to the cart.
- **PUT /cart/:product_id**: Update the quantity of an item in the cart.
- **GET /cart**: Get all items in the cart.
- **DELETE /cart/:product_id**: Remove an item from the cart.

#### Order Endpoints:
- **POST /checkout**: Proceed to checkout and create an order.
- **GET /orders/:id**: View a specific order by ID.
- **GET /orders**: View all orders of the logged-in user.
- **DELETE /orders/:id**: Cancel an order.

### Coupons
Admins can create, update, or delete discount coupons. Users can apply coupons to their cart during checkout.

#### Coupon Management Endpoints:
- **POST /coupons**: Admins can create a new coupon.
- **PUT /coupons/:id**: Admins can update an existing coupon.
- **DELETE /coupons/:id**: Admins can delete a coupon.

## Validation and Error Handling
- **Input Validation**: Using `express-validator`, the API ensures that all inputs are properly validated before processing.
- **Custom Error Handling**: Centralized error handling ensures that errors are logged and returned with the appropriate HTTP status code and message.

## Testing
- **Test-Driven Development (TDD)**: Jest is used for testing all key functionalities, including authentication, product management, cart operations, and orders.
- **Unit and Integration Tests**: Tests cover individual components as well as integration between different modules.

### Sample Test Cases:
- **Authentication**: Testing user registration, login, and token refresh.
- **Products**: Testing CRUD operations for products.
- **Cart**: Testing add, update, view, and remove cart items.
- **Orders**: Testing checkout, order retrieval, and cancellation.

## Swagger API Documentation
- The API is fully documented using Swagger.
- Swagger UI can be accessed via `/api-docs`, providing an interactive interface to explore the available endpoints, view request and response schemas, and test the API.

## Rate Limiting and Security
- **Rate Limiting**: Prevent abuse and excessive API usage by limiting the number of requests a user can make within a certain timeframe.
- **Password Hashing**: User passwords are securely hashed with **bcrypt** before storing them in the database.
- **JWT Token Validation**: Tokens are validated on every request to protected routes, ensuring users are authenticated and authorized.
- **Helmet for Security**: The API uses **Helmet** to set various HTTP headers, providing protection against common vulnerabilities like Cross-Site Scripting (XSS), content sniffing, and clickjacking.
- **CORS (Cross-Origin Resource Sharing)**: Configured to control which domains can access the API. You can restrict API access to specific domains or allow all domains for development purposes, though it is recommended to restrict access for production.
  
  ### Configure CORS:
  - You can restrict API access to specific domains:
    ```javascript
    // Enable CORS for specific domains
    app.use(cors({
      origin: ['https://your-frontend-domain.com', 'https://another-allowed-domain.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,  // Allow sending cookies with requests
    }));
    ```
  - Alternatively, allow all domains (not recommended for production):
    ```javascript
    app.use(cors());  // Allow all origins
    ```

These security measures ensure the API is well-protected against common web vulnerabilities while maintaining control over who can access the API resources.

## How to Run the Project
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up your `.env` file with the necessary environment variables (JWT_SECRET, DB connection settings, etc.).
4. Run migrations to set up the database: `npm run migrate`.
5. Start the server: `npm start`.
6. Access the API documentation at `/api-docs`.

## Conclusion
This e-commerce REST API is designed with scalability, security, and maintainability in mind. The modular architecture and centralized error handling ensure easy extensibility and robust performance in production environments. Using the TDD approach guarantees code quality and reliability across all features.

