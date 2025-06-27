import React from "react";

import { useGraphQLQuery, useGraphQLLoading } from "../graphql";
import { GET_USER_DATA } from "../graphql/queries";

interface UserData {
  user: {
    id: string;
    // Add your user fields here
  };
}

interface GraphQLExampleProps {
  userAddress: string;
}

export const GraphQLExample: React.FC<GraphQLExampleProps> = ({
  userAddress,
}) => {
  const { data, loading, error } = useGraphQLQuery<UserData>(GET_USER_DATA, {
    variables: { address: userAddress },
    skip: !userAddress,
  });

  const { isLoading, hasError } = useGraphQLLoading(loading, error);

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (hasError) {
    return <div>Error loading user data: {error?.message}</div>;
  }

  if (!data?.user) {
    return <div>No user data found</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">User Data</h3>
      <p>User ID: {data.user.id}</p>
      {/* Add more user data fields here */}
    </div>
  );
};

export default GraphQLExample;
