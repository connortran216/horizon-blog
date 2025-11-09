/**
 * Dependency Injection Container
 * Implements simple DI container for managing service dependencies
 * Follows SOLID principles by promoting loose coupling and testability
 */

// Service interfaces
import { IBlogRepository } from '../types/blog-repository.types';
import { ApiBlogRepository } from '../repositories/blog.repository';
import { IAuthService } from '../types/auth.types';
import { authService } from '../services/auth.service';

/**
 * Service factory function type
 */
export type ServiceFactory<T> = () => T;

/**
 * Service registration configuration
 */
interface ServiceRegistration<T> {
  factory: ServiceFactory<T>;
  singleton?: boolean;
  instance?: T;
}

/**
 * Dependency Injection Container
 * Manages service instantiation and dependency resolution
 */
export class DIContainer {
  private services: Map<string | symbol, ServiceRegistration<any>> = new Map();
  private resolving: Set<string | symbol> = new Set();

  constructor() {
    this.registerDefaultServices();
  }

  /**
   * Register a service with the container
   */
  register<T>(key: string | symbol, factory: ServiceFactory<T>, singleton: boolean = true): void {
    this.services.set(key, {
      factory,
      singleton,
      instance: undefined,
    });
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(key: string | symbol): T {
    const registration = this.services.get(key);
    
    if (!registration) {
      throw new Error(`Service not registered: ${String(key)}`);
    }

    // Check for circular dependencies
    if (this.resolving.has(key)) {
      throw new Error(`Circular dependency detected: ${String(key)}`);
    }

    // Return existing instance for singleton services
    if (registration.singleton && registration.instance) {
      return registration.instance;
    }

    // Create new instance
    this.resolving.add(key);
    
    try {
      const instance = registration.factory();
      
      if (registration.singleton) {
        registration.instance = instance;
      }
      
      return instance;
    } finally {
      this.resolving.delete(key);
    }
  }

  /**
   * Check if a service is registered
   */
  has(key: string | symbol): boolean {
    return this.services.has(key);
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
    this.resolving.clear();
  }

  /**
   * Get all registered service keys
   */
  getKeys(): (string | symbol)[] {
    return Array.from(this.services.keys());
  }

  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    // Register repository services
    this.register('IBlogRepository', () => new ApiBlogRepository());
    
    // Register auth service
    this.register('IAuthService', () => authService);
  }
}

// Global container instance
export const container = new DIContainer();

/**
 * Decorator for automatic dependency injection
 */
export function Inject(token: string | symbol) {
  return function (target: any, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get: () => container.resolve(token),
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Service registry constants
 */
export const SERVICE_TOKENS = {
  BLOG_REPOSITORY: 'IBlogRepository' as const,
  AUTH_SERVICE: 'IAuthService' as const,
} as const;

/**
 * Utility functions for service access
 */
export const getBlogRepository = (): IBlogRepository => container.resolve(SERVICE_TOKENS.BLOG_REPOSITORY);
export const getAuthService = (): IAuthService => container.resolve(SERVICE_TOKENS.AUTH_SERVICE);

/**
 * Factory functions for service creation
 */
export const createBlogRepository = (): IBlogRepository => container.resolve(SERVICE_TOKENS.BLOG_REPOSITORY);
export const createAuthService = (): IAuthService => container.resolve(SERVICE_TOKENS.AUTH_SERVICE);
