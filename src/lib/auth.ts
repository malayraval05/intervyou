import { toast } from "@/hooks/use-toast";
import { database, User } from "./database";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authService = {
  // Register a new user
  register: async (username: string, email: string, password: string): Promise<User | null> => {
    // Validate input
    if (!username || !email || !password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return null;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Check if user already exists
      const existingUserByUsername = await database.findUserByUsername(username);
      const existingUserByEmail = await database.findUserByEmail(email);

      if (existingUserByUsername || existingUserByEmail) {
        toast({
          title: "Error",
          description: "Username or email already exists",
          variant: "destructive",
        });
        return null;
      }

      // Create new user
      const newUser = await database.createUser({
        username,
        email,
        password, // In production, hash this password
      });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  },

  // Login user
  login: async (username: string, password: string): Promise<User | null> => {
    // Validate input
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Find user by username or email
      const user = await database.findUserByUsernameOrEmail(username);

      if (!user) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return null;
      }

      // Check password
      if (user.password !== password) {
        toast({
          title: "Error",
          description: "Invalid password",
          variant: "destructive",
        });
        return null;
      }

      // Update last login
      await database.updateUserLastLogin(user.id);

      toast({
        title: "Success",
        description: `Welcome back, ${user.username}!`,
      });

      return user;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  },

  // Logout user
  logout: () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem('intervyou_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Set current user in localStorage
  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        localStorage.setItem('intervyou_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('intervyou_current_user');
      }
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },
};
