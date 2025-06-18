# 🔐 Security - Seguridad y Validación de Entrada

> **Reglas para implementar seguridad robusta en servidores MCP**

## 🎯 Objetivo

Garantizar que el servidor MCP sea **seguro por defecto**, resistente a ataques comunes y maneje datos de entrada de forma segura.

## 📋 Reglas Obligatorias

### 1. **Validación Estricta de Entrada**

```typescript
import { z } from 'zod';

// ✅ CORRECTO - Validación exhaustiva
export const secureInputSchema = z.object({
  // Strings con límites de tamaño
  name: z.string()
    .min(1, "Nombre requerido")
    .max(100, "Nombre muy largo")
    .regex(/^[a-zA-Z0-9\s-_.]+$/, "Caracteres inválidos en nombre"),
  
  // Números con rangos seguros
  age: z.number()
    .int("Edad debe ser entero")
    .min(0, "Edad no puede ser negativa")
    .max(150, "Edad no realista"),
  
  // Emails con validación estricta
  email: z.string()
    .email("Formato de email inválido")
    .max(254, "Email muy largo"),
  
  // URLs con whitelist de protocolos
  url: z.string()
    .url("URL inválida")
    .refine(url => ['http:', 'https:'].includes(new URL(url).protocol), 
      "Solo se permiten URLs HTTP/HTTPS")
});

// ❌ INCORRECTO - Validación laxa
export const unsafeSchema = z.object({
  data: z.string(), // Sin límites ni sanitización
  url: z.string().url(), // Permite cualquier protocolo
});
```

### 2. **Sanitización de Strings**

```typescript
/**
 * Sanitiza strings de entrada para prevenir inyección de código.
 */
export class SecurityHelper {
  /**
   * Sanitiza texto plano removiendo caracteres peligrosos.
   */
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>'"&]/g, '') // Remover caracteres HTML
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control chars
      .trim()
      .slice(0, 1000); // Límite de longitud
  }

  /**
   * Sanitiza nombres de archivo.
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Solo caracteres seguros
      .replace(/\.{2,}/g, '.') // No path traversal
      .slice(0, 255); // Límite de SO
  }

  /**
   * Valida y sanitiza rutas.
   */
  static sanitizePath(path: string): string {
    if (path.includes('..') || path.includes('~')) {
      throw new McpError(ErrorCode.InvalidParams, "Ruta no segura detectada");
    }
    
    return path
      .replace(/[^a-zA-Z0-9/._-]/g, '')
      .replace(/\/+/g, '/') // Normalizar slashes
      .slice(0, 1000);
  }
}
```

### 3. **Rate Limiting y Throttling**

```typescript
/**
 * Sistema de rate limiting para prevenir abuso.
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minuto
  ) {}

  /**
   * Verifica si una solicitud está permitida.
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(clientId) || [];
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    return true;
  }
}

// Uso en resolvers
export function createSecureResolver(): ToolDefinition {
  const rateLimiter = new RateLimiter(50, 60000); // 50 req/min
  
  return {
    name: "secure-tool",
    handler: async (request) => {
      const clientId = request.meta?.clientId || 'anonymous';
      
      if (!rateLimiter.isAllowed(clientId)) {
        throw new McpError(
          ErrorCode.InvalidRequest, 
          "Límite de requests excedido. Intente más tarde."
        );
      }
      
      // Procesar request...
    }
  };
}
```

### 4. **Validación de Permisos**

```typescript
/**
 * Sistema de permisos para operaciones sensibles.
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

export class PermissionValidator {
  private allowedOperations: Set<Permission>;
  
  constructor(permissions: Permission[] = [Permission.READ]) {
    this.allowedOperations = new Set(permissions);
  }

  /**
   * Valida que una operación esté permitida.
   */
  validatePermission(required: Permission): void {
    if (!this.allowedOperations.has(required)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Operación no permitida: ${required}`
      );
    }
  }

  /**
   * Valida múltiples permisos.
   */
  validateAnyPermission(required: Permission[]): void {
    const hasPermission = required.some(perm => 
      this.allowedOperations.has(perm)
    );
    
    if (!hasPermission) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Ninguna de las operaciones requeridas está permitida: ${required.join(', ')}`
      );
    }
  }
}
```

### 5. **Logging Seguro**

```typescript
/**
 * Logger que no expone información sensible.
 */
export class SecureLogger {
  private sensitiveFields = new Set([
    'password', 'token', 'key', 'secret', 'auth',
    'email', 'phone', 'ssn', 'credit'
  ]);

  /**
   * Sanitiza objetos para logging seguro.
   */
  private sanitizeForLog(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = { ...obj };
    
    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase();
      
      if (this.sensitiveFields.has(lowerKey) || 
          lowerKey.includes('password') || 
          lowerKey.includes('token')) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeForLog(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Log de error sin información sensible.
   */
  logError(message: string, error: unknown, context?: any): void {
    const sanitizedContext = context ? this.sanitizeForLog(context) : {};
    
    console.error({
      message,
      error: error instanceof Error ? error.message : String(error),
      context: sanitizedContext,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de request sin datos sensibles.
   */
  logRequest(toolName: string, params: any): void {
    console.info({
      tool: toolName,
      params: this.sanitizeForLog(params),
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🧪 Testing de Seguridad

### 1. **Tests de Validación de Entrada**

```typescript
describe('Security Validation', () => {
  describe('Input Sanitization', () => {
    it('should sanitize malicious text input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = SecurityHelper.sanitizeText(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should prevent path traversal', () => {
      expect(() => SecurityHelper.sanitizePath('../../../etc/passwd'))
        .toThrow(McpError);
      
      expect(() => SecurityHelper.sanitizePath('~/sensitive'))
        .toThrow(McpError);
    });

    it('should limit string length', () => {
      const longString = 'a'.repeat(2000);
      const sanitized = SecurityHelper.sanitizeText(longString);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter(5, 60000);
      
      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed('client1')).toBe(true);
      }
    });

    it('should block requests over limit', () => {
      const limiter = new RateLimiter(2, 60000);
      
      limiter.isAllowed('client1');
      limiter.isAllowed('client1');
      
      expect(limiter.isAllowed('client1')).toBe(false);
    });
  });
});
```

### 2. **Tests de Casos de Ataque**

```typescript
describe('Security Attack Tests', () => {
  it('should handle SQL injection attempts', async () => {
    const maliciousInput = {
      name: "'; DROP TABLE users; --",
      operation: 'search'
    };

    await expect(resolver.handler({ params: { arguments: maliciousInput } }))
      .rejects.toThrow(McpError);
  });

  it('should handle XSS attempts', async () => {
    const xssPayload = {
      comment: '<img src=x onerror=alert(1)>',
      operation: 'add'
    };

    const result = await resolver.handler({ params: { arguments: xssPayload } });
    const responseText = result.content[0].text;
    
    expect(responseText).not.toContain('<img');
    expect(responseText).not.toContain('onerror');
  });

  it('should handle buffer overflow attempts', async () => {
    const oversizedInput = {
      data: 'x'.repeat(100000),
      operation: 'process'
    };

    await expect(resolver.handler({ params: { arguments: oversizedInput } }))
      .rejects.toThrow(McpError);
  });
});
```

## 📊 Checklist de Seguridad

### ✅ Validación de Entrada
- [ ] Todos los inputs validados con Zod schemas
- [ ] Límites de tamaño en strings y números
- [ ] Sanitización de caracteres especiales
- [ ] Validación de formatos (email, URL, etc.)
- [ ] Prevención de path traversal

### ✅ Rate Limiting
- [ ] Límites de requests por minuto implementados
- [ ] Throttling para operaciones costosas
- [ ] Identificación de clientes para rate limiting
- [ ] Manejo graceful de límites excedidos

### ✅ Permisos y Autorización
- [ ] Sistema de permisos definido
- [ ] Validación de permisos en operaciones sensibles
- [ ] Principio de menor privilegio aplicado
- [ ] Logs de operaciones privilegiadas

### ✅ Logging y Monitoreo
- [ ] Logs seguros sin información sensible
- [ ] Logging de intentos de acceso sospechosos
- [ ] Monitoreo de patrones de ataque
- [ ] Alertas para actividad anómala

### ✅ Manejo de Errores Seguro
- [ ] Errores no exponen información del sistema
- [ ] Mensajes de error consistentes
- [ ] No revelación de estructura de datos
- [ ] Logs detallados para debugging interno

### ✅ Testing de Seguridad
- [ ] Tests de inyección (SQL, XSS, etc.)
- [ ] Tests de buffer overflow
- [ ] Tests de path traversal
- [ ] Tests de rate limiting
- [ ] Tests de permisos y autorización

---

> **🚨 Principio Fundamental**: **"Seguridad por defecto"** - Asumir que toda entrada es maliciosa hasta que se demuestre lo contrario. Es mejor rechazar inputs válidos que permitir inputs maliciosos. 