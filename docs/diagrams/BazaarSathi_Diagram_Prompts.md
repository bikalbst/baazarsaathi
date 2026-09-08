# BazaarSathi Diagram Generation Prompts

The attached reference images are visual references only. Generate the following diagrams for the BazaarSathi peer-to-peer marketplace; do not copy the vehicle-rental entities or wording.

## 1. Context Diagram Prompt

Create a professional, high-resolution context diagram for a web-based peer-to-peer marketplace named **BazaarSathi**. Use one central rounded process labelled **BazaarSathi Marketplace System** and four external-entity rectangles labelled **Buyer**, **Seller**, **Administrator**, and **Payment Gateway**. Show only the system boundary and labelled information flows; do not show internal modules or database stores.

Show these directed flows:

- Buyer to system: registration/login details, search and filter queries, favourite/view actions, purchase request, payment details, chat messages, and review data.
- System to buyer: JWT/authentication result, listing details, messages, order status, payment status, and review confirmation.
- Seller to system: listing details, listing updates, chat messages, and price-estimate request.
- System to seller: listing status, sales/orders, chat messages, wallet release, seller reputation, and estimated price.
- Administrator to system: order approval and auto-accept setting updates.
- System to administrator: users, listings, orders, payments, escrow, and dashboard information.
- System to payment gateway: payment initiation and verification request.
- Payment gateway to system: payment result, payment status, and transaction identifier.

Visual requirements: landscape orientation, white background, thin dark-navy connectors with clear arrowheads, pale-yellow external entities and central system, formal Times New Roman text, balanced spacing, no crossed labels, no decorative icons, no watermark, and a bold title **BAZAARSATHI CONTEXT DIAGRAM**. Output at least 4000 × 2800 pixels or as an editable vector diagram.

## 2. Level 1 Data Flow Diagram Prompt

Create a standard **Level 1 Data Flow Diagram (DFD)** for BazaarSathi. Use rectangles for external entities, rounded process boxes for processes, and open-ended data-store symbols for stores. Every arrow must have a short data-flow label.

External entities:

- Buyer
- Seller
- Administrator
- Payment Gateway

Processes:

1. **1.0 Account and Authentication** — registration, login, password hashing, JWT authentication, and role checks.
2. **2.0 Listing and Discovery** — create/update/delete listing, browse, search, filter, sort, and view listing.
3. **3.0 Favourites and View History** — save/remove favourites and record recently viewed listings.
4. **4.0 Conversation and Real-time Chat** — create conversations, retrieve history, send messages, receive messages, and typing status.
5. **5.0 Order, Payment and Escrow** — create order, calculate 10% commission and 90% seller earning, initiate/verify Khalti payment, approve escrow, and release seller wallet earning.
6. **6.0 Review and Seller Reputation** — accept a verified-order review, store rating/comment, and update seller reputation.
7. **7.0 Administration** — dashboard overview, approve paid orders, and manage the autoAccept setting.
8. **8.0 Price Estimation** — send listing attributes to the Random Forest service and return an experimental price estimate.

Data stores:

- D1 Users
- D2 Listings
- D3 Conversations and Messages
- D4 Orders and Admin Settings
- D5 Favourites and Recently Viewed
- D6 Reviews and Reputation

Important flows: credentials and JWT results between users and Process 1.0; listing queries/details between users and Process 2.0; listing/price from Process 2.0 to Process 5.0; messages through Process 4.0 and D3; purchase/payment data through Process 5.0, D4, and the Payment Gateway; paid/completed order data from Process 5.0 to Processes 6.0 and 7.0; review records through Process 6.0 and D6; price attributes/results between Processes 2.0 and 8.0; admin approval/settings through Process 7.0 and D4. Connect each process only to relevant external entities and data stores.

Visual requirements: formal academic DFD, landscape orientation, white background, dark-navy arrows, pale-blue/teal processes, pale-yellow external entities, Times New Roman, large readable labels, minimal line crossings, no icons, no watermark, and title **BAZAARSATHI LEVEL 1 DATA FLOW DIAGRAM**. Output at least 5000 × 3400 pixels or editable vector format.

## 3. Architectural Design Prompt

Create a professional layered architectural design diagram for **BazaarSathi**, a Node.js, Express, MongoDB, React marketplace. Organize the diagram left-to-right into four clearly labelled vertical layers.

**Client Layer**

- Buyer Web Browser
- Seller Web Browser
- Administrator Web Browser

**Presentation Layer**

- React.js Client built with Vite and Tailwind CSS
- Pages and reusable components for buyer, seller, and admin dashboards
- API client and Socket.io client using JWT authorization

**Application Layer**

- Express REST API with MVC routes and controllers
- JWT authentication middleware with role and ownership authorization
- Socket.io server with authenticated rooms, messages, typing, and stop-typing events
- Domain services for escrow, Khalti verification, activity history, seller reputation, and price prediction

**Data and External Services Layer**

- MongoDB / Mongoose collections
- Khalti payment API
- Cloudinary listing-image service
- Python ML microservice using a Random Forest price model

Show labelled connections: browsers use HTTPS to the React application; React uses REST `/api` and WebSocket/Socket.io connections; Express routes protected actions through JWT middleware and controllers/services; Socket.io authenticates users and persists conversations/messages; backend services read/write MongoDB; order service initiates and verifies Khalti payments; image data uses Cloudinary URLs; price-prediction service calls the Python `/predict` endpoint. Use bidirectional arrows only where requests and responses genuinely flow both ways.

Visual requirements: clean four-column architecture, white background, soft blue/teal/orange layer panels, dark-navy outlines and arrows, Times New Roman, no 3D clip art, no watermark, no overlapping lines or labels, title **BAZAARSATHI SYSTEM ARCHITECTURE**, and output at least 4800 × 2800 pixels or editable vector format.

## 4. Database Schema Diagram Prompt

Create a detailed crow's-foot database schema diagram for BazaarSathi using the actual MongoDB/Mongoose collections below. Render each collection as a table-style box with its collection name, fields, data types, and PK/FK/UK markers. Use `_id: ObjectId` as the primary key for every collection.

Collections and fields:

- **USERS**: `_id PK ObjectId`, `name String`, `email UK String`, `password String bcrypt hash`, `role buyer|seller|admin`, `walletBalance Number`, `reputation Embedded Object`, `createdAt Date`.
- **LISTINGS**: `_id PK ObjectId`, `title String`, `description String`, `price Number`, `category String`, `condition String`, `images String[]`, `seller FK User`, `status active|sold|inactive`, `views Number`, `createdAt Date`.
- **ORDERS**: `_id PK ObjectId`, `buyer FK User`, `seller FK User`, `listing FK Listing`, `amount Number`, `quantity Number`, `price Number`, `commission Number 10%`, `sellerEarning Number 90%`, `paymentMethod khalti_wallet|card`, `status pending|completed|cancelled`, `paymentId UK String`, `paymentTransactionId String`, `paymentVerified Boolean`, `paymentStatus initiated|paid|failed|refunded`, `paidAt Date`, `releasedAt Date`, `createdAt Date`.
- **CONVERSATIONS**: `_id PK ObjectId`, `participants FK User[2]`, `listingRef FK Listing`, `conversationKey UK String`, `createdAt Date`, `updatedAt Date`.
- **MESSAGES**: `_id PK ObjectId`, `conversationId FK Conversation`, `sender FK User`, `content String`, `createdAt Date`, `read Boolean`.
- **REVIEWS**: `_id PK ObjectId`, `order FK+UK Order`, `reviewer FK User`, `seller FK User`, `listing FK Listing`, `rating Integer 1–5`, `comment String`, `createdAt Date`, `updatedAt Date`.
- **FAVORITES**: `_id PK ObjectId`, `user FK User`, `listing FK Listing`, `createdAt Date`, with unique compound key `user + listing`.
- **RECENTLY_VIEWED**: `_id PK ObjectId`, `user FK User`, `listing FK Listing`, `viewCount Number`, `lastViewedAt Date`, `createdAt Date`, with unique compound key `user + listing`.
- **ADMIN_SETTINGS**: `_id PK ObjectId`, `key UK String`, `autoAccept Boolean`. Show this as global configuration with no direct foreign-key relationship.

Show these cardinalities and relationship labels:

- One User posts zero or many Listings; each Listing has exactly one seller.
- One User may place many Orders as buyer and receive many Orders as seller; each Order has one buyer and one seller.
- One Listing may be referenced by many Orders; each Order references one Listing.
- One User may save many Favorites and one Listing may appear in many Favorites; each Favorite joins exactly one User and one Listing.
- One User may have many Recently Viewed records and one Listing may have many Recently Viewed records; each record joins one User and one Listing.
- A Conversation contains exactly two User participants; a User may participate in many Conversations.
- One Listing may provide context for many Conversations; each Conversation references one Listing.
- One Conversation contains many Messages; each Message belongs to one Conversation.
- One User may send many Messages; each Message has one sender.
- One completed Order has zero or one Review, enforced by a unique order reference.
- One User may write many Reviews as reviewer and receive many Reviews as seller; each Review identifies one reviewer and one seller.
- One Listing may have many Reviews; each Review references one Listing.

Visual requirements: landscape orientation, white background, dark-navy connectors, clear crow's-foot/cardinality symbols, soft domain colors, Times New Roman, readable field rows, a small key explaining PK/FK/UK and cardinality, minimal crossings, no watermark, title **BAZAARSATHI DATABASE SCHEMA DIAGRAM**, and output at least 6000 × 4000 pixels or editable vector format.
