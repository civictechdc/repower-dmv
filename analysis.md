# System Analysis: Contractor Details Route Error

## Problem
The error occurred in `app/routes/contractors.$contractorId.tsx` at line 36:
```
TypeError: Cannot read properties of null (reading 'name')
```

## Root Cause
The route was not handling the case where a contractor with the given ID doesn't exist in the database.

1. `getContractorById(contractorId)` returns `null` when no contractor is found
2. The loader returned `json(null)` 
3. The component received `null` but cast it to `Contractor` type
4. Accessing `contractor.name` on `null` caused the TypeError

## Code Flow
```typescript
// Loader function
export async function loader({ params }: LoaderFunctionArgs) {
  const contractorId = params.contractorId as string;
  return json(await getContractorById(contractorId)); // Returns json(null)
}

// Component
const contractor = useLoaderData<typeof loader>() as Contractor; // null cast to Contractor
return <Heading>{contractor.name}</Heading>; // Error: null.name
```

## Solution
Following the pattern used in other routes (like `notes.$noteId.tsx`):

1. **Check for null in loader**: Throw a 404 response when contractor not found
2. **Add ErrorBoundary**: Handle 404 errors gracefully with user-friendly UI

## Changes Made

### 1. Updated Loader
```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  const contractorId = params.contractorId as string;
  const contractor = await getContractorById(contractorId);
  if (!contractor) {
    throw new Response("Not Found", { status: 404 });
  }
  return json(contractor);
}
```

### 2. Added Error Boundary
```typescript
export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return (
      <div>
        <Heading>Contractor Not Found</Heading>
        <p>The contractor you're looking for doesn't exist.</p>
        <Link to="/contractors" className="text-blue-500 underline">
          Back to Contractor List
        </Link>
      </div>
    );
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
```

## Benefits
- **Prevents crashes**: No more null reference errors
- **Better UX**: Users see a helpful "Contractor Not Found" page instead of a crash
- **Proper HTTP semantics**: Returns 404 status for missing resources
- **Consistent pattern**: Follows the same error handling as other routes in the app

## Testing
- Verified the fix follows existing patterns in the codebase
- Unit tests pass (unrelated test failures exist but are not caused by this change)
- Error boundary provides graceful degradation

## Code Smells Addressed
- **Null reference without checking**: Fixed by proper null checking
- **Unsafe type casting**: Removed casting null to Contractor type
- **Missing error handling**: Added comprehensive error boundary
