class ListNode<T> {
  public value: T
  public next: ListNode<T> | null

  constructor(value: T) {
    this.value = value
    this.next = null
  }
}

export class Queue<T> {
  private head: ListNode<T> | null
  private tail: ListNode<T> | null

  constructor() {
    this.head = null
    this.tail = null
  }

  public enqueue(item: T): void {
    const newNode = new ListNode(item)

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
      return
    }

    this.tail!.next = newNode
    this.tail = newNode
  }

  public dequeue(): T | null {
    if (!this.head) {
      return null
    }

    const removedValue = this.head.value
    this.head = this.head.next

    if (!this.head) {
      this.tail = null
    }

    return removedValue
  }

  public peek(): T | null {
    return this.head ? this.head.value : null
  }

  public isEmpty(): boolean {
    return this.head === null
  }

  public toArray() {
    const result: T[] = []

    let current = this.head

    while (current !== null) {
      result.push(current.value)
      current = current.next
    }

    return result
  }
}
