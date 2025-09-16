// SSR-safe storage fallbacks for environments without window/localStorage/indexedDB

export const isServer = typeof window === "undefined"

class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length(): number {
    return this.store.size
  }
  clear(): void {
    this.store.clear()
  }
  getItem(key: string): string | null {
    const val = this.store.get(key)
    return typeof val === "undefined" ? null : val
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

export const safeLocalStorage: Storage = isServer
  ? new MemoryStorage()
  : window.localStorage
