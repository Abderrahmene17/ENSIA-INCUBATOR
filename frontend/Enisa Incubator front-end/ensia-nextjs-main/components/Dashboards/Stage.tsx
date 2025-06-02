// In a separate file like `types.ts` or directly in the component file
type Stage = {
    name: string;
    status: "done" | "current" | "pending";
    description: string;
  };

  export default Stage;