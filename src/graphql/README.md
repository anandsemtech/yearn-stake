# GraphQL Setup

This directory contains the GraphQL configuration for the project using Apollo Client.

## Setup

1. **Environment Variable**: Add your subgraph URL to your `.env` file:

   ```
   VITE_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/your-subgraph-name
   ```

2. **Provider**: The `GraphQLProvider` is already integrated into the app's provider hierarchy in `src/Provider.tsx`.

## Files

- `client.ts` - Apollo Client configuration
- `provider.tsx` - GraphQL Provider component
- `hooks.ts` - Custom hooks for GraphQL operations
- `queries.ts` - GraphQL queries and mutations
- `index.ts` - Export file for easy importing

## Usage

### Basic Query

```tsx
import { useGraphQLQuery } from "../graphql";
import { GET_USER_DATA } from "../graphql/queries";

const { data, loading, error } = useGraphQLQuery(GET_USER_DATA, {
  variables: { address: userAddress },
});
```

### Basic Mutation

```tsx
import { useGraphQLMutation } from "../graphql";
import { CREATE_USER } from "../graphql/queries";

const [createUser, { loading, error }] = useGraphQLMutation(CREATE_USER);

const handleCreateUser = async () => {
  try {
    const result = await createUser({
      variables: { address: userAddress },
    });
    console.log("User created:", result.data);
  } catch (err) {
    console.error("Error creating user:", err);
  }
};
```

### Lazy Query

```tsx
import { useGraphQLLazyQuery } from "../graphql";

const [getUserData, { data, loading }] = useGraphQLLazyQuery(GET_USER_DATA);

const handleFetchUser = () => {
  getUserData({ variables: { address: userAddress } });
};
```

## Customization

1. **Update Queries**: Modify `queries.ts` to match your subgraph schema
2. **Type Policies**: Add cache type policies in `client.ts` for complex data merging
3. **Error Handling**: Customize error handling in the hooks as needed

## Example Component

See `src/components/GraphQLExample.tsx` for a complete example of using the GraphQL setup.
