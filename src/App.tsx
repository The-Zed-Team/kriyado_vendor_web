import {AuthProvider} from "./feature/auth/context/AuthContext";

import AppRouter from "@/routes/AppRouter.tsx";

function App() {
  return (
    <AuthProvider>
      <AppRouter/>
    </AuthProvider>
  );
}

export default App;
