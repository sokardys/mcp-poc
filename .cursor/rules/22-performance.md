# ⚡ Performance - Optimización y Rendimiento

> **Reglas para crear servidores MCP rápidos, eficientes y escalables**

## 🎯 Objetivo

Garantizar que el servidor MCP tenga **latencia mínima, throughput óptimo y uso eficiente de recursos** para una experiencia de usuario fluida.

## 📋 Reglas Obligatorias

### 1. **Optimización de Validación Zod**

```typescript
import { z } from 'zod';

// ✅ CORRECTO - Schema compilado y reutilizado
export const optimizedSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number()
});

// Pre-compilar schema para mejor rendimiento
const compiledSchema = optimizedSchema.strict();

export function validateInput(data: unknown) {
  // Usar schema compilado reutilizable
  return compiledSchema.parse(data);
}

// ❌ INCORRECTO - Schema recreado en cada validación
export function slowValidation(data: unknown) {
  const schema = z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  });
  return schema.parse(data); // Compilación en cada llamada
}
```

### 2. **Caching Inteligente**

```typescript
/**
 * Sistema de cache con TTL y LRU eviction.
 */
export class PerformanceCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; hits: number }>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 1000, ttlMs = 300000) { // 5 min TTL
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update hit count for LRU
    entry.hits++;
    return entry.data;
  }

  set(key: string, data: T): void {
    // Evict if at max size
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 1
    });
  }

  private evictLRU(): void {
    let lruKey = '';
    let minHits = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

// Uso en resolvers
const calculatorCache = new PerformanceCache<number>(500, 300000);

export function createOptimizedCalculatorResolver(): ToolDefinition {
  return {
    name: "calculator",
    handler: async (request) => {
      const input = validateInput(request.params.arguments);
      
      // Cache key basado en operación
      const cacheKey = `${input.operation}-${input.a}-${input.b}`;
      
      // Check cache first
      const cached = calculatorCache.get(cacheKey);
      if (cached !== undefined) {
        return { content: [{ type: "text", text: cached.toString() }] };
      }
      
      // Compute result
      const result = calculatorUseCase.calculate(input);
      
      // Cache result
      calculatorCache.set(cacheKey, result);
      
      return { content: [{ type: "text", text: result.toString() }] };
    }
  };
}
```

### 3. **Async Operations Optimization**

```typescript
/**
 * Pool de operaciones asíncronas para evitar saturación.
 */
export class AsyncOperationPool {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private readonly concurrencyLimit: number;

  constructor(concurrencyLimit = 10) {
    this.concurrencyLimit = concurrencyLimit;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const operation = this.queue.shift()!;
    
    try {
      await operation();
    } finally {
      this.running--;
      this.processQueue(); // Process next operation
    }
  }
}

// Uso para operaciones I/O intensivas
const asyncPool = new AsyncOperationPool(5);

export class OptimizedFileUseCase {
  async processFiles(filePaths: string[]): Promise<string[]> {
    // Procesar archivos en paralelo controlado
    const results = await Promise.all(
      filePaths.map(path => 
        asyncPool.execute(() => this.processFile(path))
      )
    );
    
    return results;
  }

  private async processFile(path: string): Promise<string> {
    // Simular procesamiento de archivo
    return new Promise(resolve => {
      setTimeout(() => resolve(`processed: ${path}`), 100);
    });
  }
}
```

### 4. **Memory Management**

```typescript
/**
 * Gestor de memoria para prevenir memory leaks.
 */
export class MemoryManager {
  private objects = new WeakSet();
  private timers = new Set<NodeJS.Timeout>();
  private intervals = new Set<NodeJS.Timeout>();

  /**
   * Registra un objeto para limpieza automática.
   */
  register(obj: object): void {
    this.objects.add(obj);
  }

  /**
   * Crea un timer con limpieza automática.
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }

  /**
   * Crea un interval con limpieza automática.
   */
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Limpia todos los recursos.
   */
  cleanup(): void {
    // Clear timers
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Clear intervals
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    // Force GC if available
    if (global.gc) {
      global.gc();
    }
  }
}

// Usar en resolvers
const memoryManager = new MemoryManager();

export function createMemoryEfficientResolver(): ToolDefinition {
  return {
    name: "memory-efficient",
    handler: async (request) => {
      try {
        const result = await processRequest(request);
        return result;
      } finally {
        // Cleanup después de cada request
        memoryManager.cleanup();
      }
    }
  };
}
```

### 5. **Response Optimization**

```typescript
/**
 * Optimizador de respuestas MCP.
 */
export class ResponseOptimizer {
  /**
   * Comprime respuestas grandes.
   */
  static optimizeResponse(content: string): string {
    // Remover whitespace innecesario
    const compressed = content
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '');

    // Truncar si es muy largo
    if (compressed.length > 10000) {
      return compressed.substring(0, 9950) + '... [truncated]';
    }

    return compressed;
  }

  /**
   * Agrupa múltiples operaciones similares.
   */
  static batchOperations<T, R>(
    items: T[],
    operation: (batch: T[]) => Promise<R[]>,
    batchSize = 10
  ): Promise<R[]> {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return Promise.all(
      batches.map(batch => operation(batch))
    ).then(results => results.flat());
  }

  /**
   * Streaming de respuestas largas.
   */
  static async streamResponse(
    generator: AsyncGenerator<string>
  ): Promise<{ type: 'text'; text: string }[]> {
    const chunks: string[] = [];
    
    for await (const chunk of generator) {
      chunks.push(chunk);
      
      // Flush chunks si hay muchos
      if (chunks.length > 100) {
        break;
      }
    }

    return [{ 
      type: 'text', 
      text: this.optimizeResponse(chunks.join('\n'))
    }];
  }
}
```

## 📊 Métricas de Performance

### 1. **Benchmarking**

```typescript
/**
 * Herramientas de benchmarking para resolvers.
 */
export class PerformanceBenchmark {
  private metrics = new Map<string, number[]>();

  /**
   * Mide el tiempo de ejecución de una función.
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 1000 measurements
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Obtiene estadísticas de rendimiento.
   */
  getStats(name: string): { avg: number; min: number; max: number; p95: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[p95Index]
    };
  }
}

// Uso en tests de performance
const benchmark = new PerformanceBenchmark();

describe('Performance Tests', () => {
  it('should complete calculator operations under 10ms', async () => {
    const stats = await benchmark.measure('calculator', async () => {
      return calculatorResolver.handler(testRequest);
    });

    const performanceStats = benchmark.getStats('calculator');
    expect(performanceStats?.avg).toBeLessThan(10);
    expect(performanceStats?.p95).toBeLessThan(25);
  });
});
```

### 2. **Memory Profiling**

```typescript
/**
 * Monitor de uso de memoria.
 */
export class MemoryMonitor {
  private baseline: NodeJS.MemoryUsage;

  constructor() {
    this.baseline = process.memoryUsage();
  }

  /**
   * Obtiene el uso actual de memoria.
   */
  getCurrentUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    heapDelta: number;
  } {
    const current = process.memoryUsage();
    
    return {
      heapUsed: current.heapUsed,
      heapTotal: current.heapTotal,
      external: current.external,
      rss: current.rss,
      heapDelta: current.heapUsed - this.baseline.heapUsed
    };
  }

  /**
   * Detecta posibles memory leaks.
   */
  detectLeaks(): boolean {
    const current = this.getCurrentUsage();
    const deltaGB = current.heapDelta / (1024 * 1024 * 1024);
    
    return deltaGB > 0.5; // Leak si creció >500MB
  }

  /**
   * Resetea baseline.
   */
  reset(): void {
    this.baseline = process.memoryUsage();
  }
}
```

## 📊 Checklist de Performance

### ✅ Optimización de Código
- [ ] Schemas Zod pre-compilados y reutilizados
- [ ] Cache implementado para operaciones costosas
- [ ] Async operations con control de concurrencia
- [ ] Memory management y cleanup automático
- [ ] Response optimization para payloads grandes

### ✅ Benchmarking
- [ ] Tests de performance para todos los resolvers
- [ ] Métricas de latencia (avg, p95, p99)
- [ ] Límites de tiempo definidos (<50ms típico)
- [ ] Monitoreo de throughput (requests/second)
- [ ] Profiling de memory usage

### ✅ Escalabilidad
- [ ] Rate limiting implementado
- [ ] Connection pooling para I/O
- [ ] Batch processing para operaciones múltiples
- [ ] Streaming para responses grandes
- [ ] Resource cleanup automático

### ✅ Monitoreo
- [ ] Métricas de CPU y memoria
- [ ] Detection de memory leaks
- [ ] Alertas para degradación de performance
- [ ] Logging de operaciones lentas
- [ ] Dashboards de métricas en tiempo real

---

> **⚡ Principio Clave**: **"Medir primero, optimizar después"** - Sin métricas, las optimizaciones son solo conjeturas. El performance debe ser **medible, repetible y sostenible**. 