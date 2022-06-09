/* 
  Since I'm a java buoy, I'm used to small comforts, so I snatched this nice implementation for linked list from:
  https://dev.to/glebirovich/typescript-data-structures-linked-list-3o8i
*/
export interface ILinkedList<T> {
  insertInBegin(data: T): Node<T>;
  insertAtEnd(data: T): Node<T>;
  deleteNode(node: Node<T>): void;
  traverse(): T[];
  size(): number;
  findFirst(comparator: (data: T) => boolean): Node<T> | null;
  searchAll(comparator: (data: T) => boolean): Node<T>[] | null;
  getLast(node?: Node<T>): Node<T>;
}

export class Node<T> {
  public next: Node<T> | null = null;
  public prev: Node<T> | null = null;
  constructor(public data: T) { }
}