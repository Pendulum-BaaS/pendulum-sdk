# Pendulum SDK

A TypeScript SDK for connecting frontend applications to the Pendulum Backend-as-a-Service platform. Provides seamless integration for database operations, authentication, and real-time updates.

## Features

- **Database Operations** - Full CRUD operations with TypeScript generics
- **Authentication** - User registration, login, and logout
- **Real-time Updates** - Subscribe to live data changes via Server-Sent Events
- **TypeScript First** - Built with TypeScript for excellent developer experience
- **Error Handling** - Comprehensive error handling with detailed error messages
- **Configurable** - Easy configuration for different environments

## Installation

```bash
npm install @pendulum/sdk
```

## Quick Start

```typescript
import { PendulumClient } from "@pendulum/sdk";

// Initialize the client
const client = new PendulumClient({
  apiUrl: "https://your-app-server.com",
  eventsUrl: "https://your-event-server.com/events"
});

// Database operations
const users = await client.db.getAll("users");
if (users.success) {
  console.log(users.data);
}

// Authentication
const loginResult = await client.auth.login("username", "password");
if (loginResult.success) {
  console.log("Logged in:", loginResult.userId);
}

// Real-time subscriptions
client.realtime.subscribe("users", (event) => {
  console.log("User data changed:", event);
});
```

## Configuration

The SDK accepts the following configuration options:

```typescript
interface PendulumConfig {
  apiUrl?: string;      // Default: "http://localhost:3000"
  eventsUrl?: string;   // Default: "http://localhost:8080/events"
}
```

### Environment-specific Setup

**Development:**
```typescript
const client = new PendulumClient(); // Uses defaults
```

**Production:**
```typescript
const client = new PendulumClient({
  apiUrl: process.env.REACT_APP_API_URL,
  eventsUrl: process.env.REACT_APP_EVENTS_URL
});
```

## API Reference

### Database Operations

All database methods return a `DatabaseResult<T>`, where `T` defaults to `any` to allow for optional typing, with the following structure:

```typescript
interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

#### Read Operations

```typescript
// Get a single record
const user = await client.db.getOne<User>("users", "userId");

// Get multiple records with pagination
const users = await client.db.getSome<User[]>("users", 10, 0, "createdAt");

// Get all records
const allUsers = await client.db.getAll<User[]>("users");
```

#### Write Operations

```typescript
// Insert new records
const result = await client.db.insert("users", [
  { name: "John", email: "john@example.com" }
]);

// Update a single record
const updated = await client.db.updateOne("users", "userId", {
  name: "John Doe"
});

// Update multiple records
const bulkUpdate = await client.db.updateSome("users",
  { status: "inactive" },
  { status: "archived" }
);

// Update all records
const updateAll = await client.db.updateAll("users", { lastSeen: new Date() });

// Replace a record completely
const replaced = await client.db.replace("users", "userId", {
  name: "Jane Doe",
  email: "jane@example.com"
});
```

#### Delete Operations

```typescript
// Delete a single record
const deleted = await client.db.removeOne("users", "userId");

// Delete multiple records
const bulkDelete = await client.db.removeSome("users", { status: "archived" });

// Delete all records
const deleteAll = await client.db.removeAll("users");
```

### Authentication

Authentication methods return `AuthResult` or `LoginResult`:

```typescript
interface AuthResult {
  success: boolean;
  error?: string;
}

interface LoginResult extends AuthResult {
  userId?: string;
}
```

```typescript
// Register a new user
const registerResult = await client.auth.register("username", "email@example.com", "password");

// Login
const loginResult = await client.auth.login("username", "password");
if (loginResult.success) {
  console.log("User ID:", loginResult.userId);
}

// Logout
const logoutResult = await client.auth.logout();
```

### Real-time Updates

Subscribe to live data changes using Server-Sent Events from the Pendulum Event Server:

```typescript
// Subscribe to collection changes
const handleUserUpdate = (event: DatabaseEvent) => {
  console.log('User data changed:', event);
};

client.realtime.subscribe("users", handleUserUpdate);

// Unsubscribe from updates
client.realtime.unsubscribe("users", handleUserUpdate);

// Disconnect from all real-time updates
client.realtime.disconnect();
```

**⚠️ Important: Subscription Management**
The subscription system uses referential equality to track callback functions. **Always use named functions to avoid duplicate subscriptions**:
```typescript
// ❌ Don't do this - creates duplicate subscriptions
client.realtime.subscribe("users", (event) => console.log(event));
client.realtime.subscribe("users", (event) => console.log(event));

// ✅ Do this instead - uses function reference
const handleUserUpdate = (event) => console.log(event);
client.realtime.subscribe("users", handleUserUpdate);
client.realtime.subscribe("users", handleUserUpdate); // Second subscription is de-duplicated
``

#### DatabaseEvent Structure

```typescript
interface DatabaseEvent {
  collection: string;
  action: "insert" | "update" | "delete";
  eventData: {
    affected?: any[];           // Records that were affected
    filter?: any;               // Filter used for update/delete operations
    updateOperation?: any;      // Changes made in update operations
    count?: number;             // Number of affected records
    ids?: string[];             // IDs of affected records
  };
}
```

## Framework Integration

### React Integration

The Pendulum SDK works seamlessly with React applications and allows you to choose exactly which pieces of frontend state should update in real-time to mirror backend application state.

```tsx
import React, { useState, useEffect } from "react";
import { PendulumClient, type DatabaseEvent } from "@pendulum/sdk";

const client = new PendulumClient({
	apiUrl: process.env.REACT_APP_API_URL,
	eventsUrl: process.env.REACT_APP_EVENTS_URL,
});

function UsersList() {
	const [users, setUsers] = useState([]);

	// callback function for realtime subscription
	const addUsers = (event: DatabaseEvent) => {
			const { action, eventData } = event;
			if (action === "insert") {
				const newUsers = eventData.affected;
				setUsers(prev => [...prev, ...newUsers].sort());
			}
	};

	React.useEffect(() => {
			// initial fetch on mount
			const fetchUsers = async () => {
				try {
					const response = await client.db.getAll("users");
					if (response.success) {
						const fetchedUsers = response.data;
						setUsers(fetchedUsers);
					} else {
						throw new Error(response.error);
					}
				} catch (error) {
					/* error handling */
				}
			};

			fetchUsers();

			// Subscribe to real-time event updates
			client.realtime.subscribe("users", addUsers);

			// Cleanup subscription on unmount
			return () => client.realtime.unsubscribe("users", addUsers);
	}, []);

	return (
		<div>
			{users.map(user => (
				<div key={user.id}>{user.name}</div>
			))}
		</div>
	);
}
```

## TypeScript Support

The SDK is built with TypeScript and provides type safety out of the box:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Type-safe database operations
const user = await client.db.getOne<User>("users", "userId");
if (user.success) {
  console.log(user.data.name); // TypeScript knows this is a string
}

// Type-safe real-time subscriptions
client.realtime.subscribe("users", (event: DatabaseEvent) => {
  // TypeScript compiler knows that event has `collection`, `action`, and `eventData` properties
});
```

## Error Handling

All SDK methods use consistent error handling. Network errors, HTTP errors (4xx, 5xx), and parsing errors are automatically caught and returned in a structured format:

```typescript
const result = await client.db.getOne("users", "invalid-id");
if (!result.success) {
  console.error("Error:", result.error);
  // Handle the error appropriately
} else {
  console.log("Data:", result.data);
}
```

## Real-time Connection Management

The SDK automatically handles connection management for real-time updates:

- **Automatic reconnection** with exponential backoff
- **Connection state management**
- **Error recovery** for network issues
- **Clean disconnection** when needed

## Examples

### User Management with Real-time Updates

```typescript
import { PendulumClient, type DatabaseEvent, type User } from "@pendulum/sdk";

const client = new PendulumClient({
  apiUrl: "https://api.myapp.com",
  eventsUrl: "https://events.myapp.com/events"
});

// Subscribe to user changes
const handleUpdateUsers = (event: DatabaseEvent) => {
	if (event.action === "insert") {
    console.log("New user added:", event.eventData.affected);
  } else if (event.action === "update") {
    console.log("User updated:", event.eventData.affected);
  } else if (event.action === "delete") {
    console.log("User deleted:", event.eventData.ids);
  }
}
client.realtime.subscribe("users", handleUpdateUsers);

// Create a new user
const newUser = await client.db.insert("users", [{
  name: "Alice Smith",
  email: "alice@example.com"
}]);

if (newUser.success) {
  console.log("User created successfully");
  // DatabaseEvent with new user will be pushed to all active clients
}

// Disconnect from real-time updates and close connection to event server
client.realtime.disconnect()
```

### Authentication Flow

```typescript
async function handleLogin(username: string, password: string) {
  const result = await client.auth.login(username, password);

  if (result.success) {
    console.log("Login successful!", result.userId);
    // Redirect to dashboard or update UI state
    return { success: true, userId: result.userId };
  } else {
    console.error("Login failed:", result.error);
    // Show error message to user
    return { success: false, error: result.error };
  }
}
```

## Contributing

This SDK is part of the Pendulum Backend-as-a-Service platform. For issues, feature requests, or contributions, please refer to the main Pendulum project [repository](https://github.com/Pendulum-BaaS/pendulum).
