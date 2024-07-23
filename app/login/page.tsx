import { Suspense } from 'react';
import Login from '../_components/Login';
import LoginErrorHandler from './login-error-handler';

export default function LoginPage() {
  return (
    <div>
      <Login />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginErrorHandler />
      </Suspense>
    </div>
  );
}