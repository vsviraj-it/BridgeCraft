# Coding Standards and Guidelines - BridgeCraft

This document outlines the coding standards and best practices for the BridgeCraft project. CodeRabbit uses these guidelines to review pull requests and provide feedback.

## 1. General Principles

- **Clarity over Brevity**: Write code that is easy to read and understand.
- **Consistency**: Follow the established patterns throughout the codebase.
- **TypeScript**: Use TypeScript for all new code. Avoid using `any` wherever possible.

## 2. Naming Conventions

### 2.1 Files and Directories

- **Components**: `PascalCase.tsx` (e.g., `OnBoardingScreen.tsx`)
- **Utilities/Hooks**: `camelCase.ts` (e.g., `useAuth.ts`, `responsive.ts`)
- **Styles**: If kept separate, use `PascalCase.styles.ts`.

### 2.2 Code Elements

- **Variables & Functions**: `camelCase` (e.g., `handlePress`, `userName`)
- **Interfaces/Types**: `PascalCase` (e.g., `OnBoardingProps`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PRIMARY_COLOR`, `API_RETRY_LIMIT`)

## 3. Component Standards

- **Functional Components**: Use functional components with `React.FC` or explicit return types.
- **Props**: Always define props using an `interface` or `type`.
- **Destructuring**: Destructure props and state for cleaner code.
- **Logic**: Keep components focused on the UI. Move complex logic into custom hooks or utility functions.

## 4. Styling Standards

- **StyleSheet**: Use `StyleSheet.create` for all styles.
- **No Inline Styles**: Avoid inline styles unless the value is truly dynamic (and even then, prefer derived styles).
- **Responsive Design**: Use the responsive utilities from `src/utils/responsive.ts`:
  - `wp(percentage)`: Width percentage.
  - `hp(percentage)`: Height percentage.
  - `fontSize(size)`: Scalable font size.
- **Consistency**: Maintain consistent spacing and layout using project-standard paddings and margins.

## 5. React Native Best Practices

- **StatusBar**: Ensure `StatusBar` is handled correctly on each screen.
- **SafeAreaView**: Use `SafeAreaView` (from `react-native-safe-area-context`) to handle notches and home indicators.
- **Optimization**: Use `useMemo` and `useCallback` for expensive operations or when passing functions to memoized components.
- **Images**: Use `require` for local assets and ensure they are placed in `src/assets`.

## 6. CodeRabbit Review Rules

- **Flag Unused Code**: Identify and flag any unused variables, imports, or functions.
- **Check Styles**: Flag any usage of inline styles.
- **Type Safety**: Flag the use of `any` and suggest more specific types.
- **Performance**: Flag missing `key` props in lists or inefficient rendering patterns.
- **Responsiveness**: Flag hardcoded pixel values when they should be using `wp`, `hp`, or `fontSize`.
