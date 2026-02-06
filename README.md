# 🎓 WB Exam Quest: Ace Your Exams with Confidence

An interactive and comprehensive platform designed to empower students in their exam preparation journey. WB Exam Quest provides a rich environment for learning, practicing, and mastering key concepts, ensuring you're thoroughly prepared for any challenge. With a focus on intuitive design and robust functionality, this application aims to make studying engaging and effective.

## ✨ Key Features

*   🚀 **Interactive Exam Simulation:** Practice with timed quizzes and mock exams that replicate real test conditions.
*   📊 **Performance Analytics:** Track your progress with detailed insights into your strengths and weaknesses.
*   📚 **Extensive Question Bank:** Access a vast collection of questions covering various subjects and topics.
*   ✍️ **Personalized Study Paths:** Tailor your learning experience based on your performance and learning goals.
*   🔐 **Secure User Authentication:** Manage your study profile and progress securely.
*   📱 **Responsive User Interface:** Enjoy a seamless experience across all your devices, from desktop to mobile.
*   🎨 **Beautifully Designed UI Components:** Leverages Radix UI and Tailwind CSS for a modern and accessible interface.

## 🛠️ Tech Stack

<p align="left">
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://react.dev/" target="_blank">
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  </a>
  <a href="https://vitejs.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </a>
  <a href="https://radix-ui.com/" target="_blank">
    <img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white" alt="Radix UI" />
  </a>
  <a href="https://supabase.com/" target="_blank">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </a>
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </a>
  <a href="https://www.npmjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
  </a>
  <a href="https://bun.sh/" target="_blank">
    <img src="https://img.shields.io/badge/Bun-FBF00B?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" />
  </a>
</p>

## 🚀 Installation

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm or Yarn (npm is used in examples)
*   Bun (optional, but `bun.lockb` indicates it's used for some parts of the project)

### 1. Clone the Repository

First, clone the `wb-exam-quest` repository to your local machine:

```bash
git clone https://github.com/pandeypremlata1964-cmd/wb-exam-quest.git
cd wb-exam-quest
```

### 2. Install Dependencies

Install the necessary npm packages. If you prefer `yarn`, you can use `yarn install` instead.

```bash
npm install
# or
# yarn install
# If you use Bun for some parts, you might also run:
# bun install
```

### 3. Environment Variables

Create a `.env` file in the root of your project and add the required environment variables. These typically include Supabase project URLs and API keys.

```dotenv
# .env example
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
# Add any other environment variables your application needs
```

You can find these details in your Supabase project settings under "API".

### 4. Supabase Setup (Optional, but recommended)

If you plan to develop features interacting with the database, ensure your Supabase project is set up or run the provided migrations. The `supabase` directory suggests there are Supabase-related configurations or SQL schemas.

You might need to install the Supabase CLI:

```bash
npm install -g supabase-cli
```

Then, link your project and run migrations (adjust commands as per your actual `supabase` directory content):

```bash
supabase login
supabase link --project-ref your-supabase-project-id
supabase db diff -f init > supabase/migrations/0_init.sql
supabase migration up # Apply migrations
```

### 5. Start the Development Server

Once the dependencies are installed and environment variables are set, you can start the development server:

```bash
npm run dev
# or
# yarn dev
# or
# bun dev
```

The application will typically be accessible at `http://localhost:5173` (or the port specified in your `vite.config.ts`).

## 💡 Usage

This section demonstrates how to interact with the WB Exam Quest application.

### Running the Application

After installation and starting the development server, open your web browser and navigate to the address provided in the terminal (e.g., `http://localhost:5173`).

### Example Workflow: Taking a Mock Exam

1.  **Register/Login:** If you're a new user, register for an account. Existing users can log in using their credentials.
2.  **Browse Exams:** Navigate to the "Exams" or "Quizzes" section.
3.  **Start Exam:** Select an exam to begin. You'll be presented with questions, and a timer may start.
4.  **Answer Questions:** Choose the correct options or input your answers.
5.  **Submit Exam:** Once you've completed all questions or the timer runs out, submit your exam.
6.  **Review Results:** View your score, detailed performance analysis, and correct answers. This helps identify areas for improvement.

### Utilizing UI Components (Developers)

The project leverages Radix UI components (visible in `components.json` and `package.json`). If you're extending the UI, you can use these pre-styled and accessible components.

For example, to use a `Button` from a custom components library derived from Radix:

```tsx
// src/components/ui/button.tsx
// (This file would typically contain the Button component definition)

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

And then using it in a React component:

```tsx
// src/pages/Dashboard.tsx
import { Button } from '@/components/ui/button'; // Adjust import path as necessary

function Dashboard() {
  return (
    <div>
      <h1>Welcome to WB Exam Quest!</h1>
      <Button onClick={() => alert('Starting a new exam!')}>Start New Exam</Button>
      <Button variant="outline" className="ml-2">View Results</Button>
      <Button variant="destructive" size="sm" onClick={() => console.log('Delete account')}>Delete Account</Button>
    </div>
  );
}

export default Dashboard;
```

## 📂 Project Structure

Here's a simplified overview of the most important directories and files in the project:

```
wb-exam-quest/
├── public/                 # Static assets (images, fonts, etc.)
├── src/                    # Main application source code
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable React components (UI library, custom components)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, helpers, and configurations
│   ├── pages/              # Application pages/routes
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point of the React application
├── supabase/               # Supabase-related files (migrations, RLS policies, functions)
│   └── migrations/         # Database migration scripts
├── .env                    # Environment variables (local config)
├── bun.lockb               # Dependencies lock file for Bun
├── components.json         # Configuration for shadcn/ui or similar component library
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration for Tailwind CSS
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build tool configuration
└── vitest.config.ts        # Vitest testing framework configuration
```

## 🤝 Contributing

We welcome contributions to WB Exam Quest! Whether it's bug reports, feature requests, or code contributions, your help is appreciated.

To contribute:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Make your changes**, ensuring they adhere to the project's coding style (ESLint configured).
4.  **Write clear, concise commit messages.**
5.  **Push your branch** to your forked repository.
6.  **Open a Pull Request** to the `main` branch of this repository, describing your changes in detail.

Please ensure your code passes all linting and testing checks before submitting a PR.

## 📄 License

This project is currently without a specified license. For questions regarding usage or licensing, please contact the repository owner.
