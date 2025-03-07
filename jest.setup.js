// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(() => {
      return {
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
          expires: new Date(Date.now() + 2 * 86400).toISOString(),
        },
        status: 'authenticated',
      };
    }),
  };
});

// Mock Three.js related modules
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="three-canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: {
      position: { set: jest.fn() },
      lookAt: jest.fn(),
    },
    gl: {
      domElement: document.createElement('canvas'),
    },
    scene: {},
  })),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
  Environment: () => null,
  Html: ({ children }) => children,
}));

// Mock MediaQueryList
window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
});