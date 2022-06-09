import { ILinkedList, Node } from "./ILinkedList";

export class LinkedList<T> implements ILinkedList<T> {
    private head: Node<T> | null = null;

    public insertAtEnd(data: T): Node<T> {
        const node = new Node(data);
        if (!this.head) {
            this.head = node;
        } else {
            const lastNode = this.getLast();
            node.prev = lastNode;
            lastNode.next = node;
        }
        return node;
    }

    public insertInBegin(data: T): Node<T> {
        const node = new Node(data);
        if (!this.head) {
            this.head = node;
        } else {
            this.head.prev = node;
            node.next = this.head;
            this.head = node;
        }
        return node;
    }

    public deleteNode(node: Node<T>): void {
        if (!node.prev) {
            this.head = node.next;
        } else {
            const prevNode = node.prev;
            prevNode.next = node.next;
        }
    }

    public searchAll(comparator: (data: T) => boolean): Node<T>[] | null {
        const nodes: Node<T>[] = [];
        const checkNext = (node: Node<T>, nodez: Node<T>[]): Node<T> | null => {
            if (comparator(node.data)) {
                nodez.push(node);
                return node.next ? checkNext(node.next, nodez) : null; 
            }
            return node.next ? checkNext(node.next, nodez) : null;
        };

        if (this.head) {
            while (checkNext(this.head, nodes) != null) {
                console.log("checking transaction...");
            }
        }

        return nodes;
    }

    public findFirst(comparator: (data: T) => boolean): Node<T> | null {
        const checkNext = (node: Node<T>): Node<T> | null => {
            if (comparator(node.data)) {
                return node;
            }
            return node.next ? checkNext(node.next) : null;
        };

        return this.head ? checkNext(this.head) : null;
    }

    public traverse(): T[] {
        const array: T[] = [];
        if (!this.head) {
            return array;
        }

        const addToArray = (node: Node<T>): T[] => {
            array.push(node.data);
            return node.next ? addToArray(node.next) : array;
        };
        return addToArray(this.head);
    }

    public size(): number {
        return this.traverse().length;
    }

    public getLast(node?: Node<T>): Node<T> {
        if (node) {
            return node.next ? this.getLast(node.next) : node;
        } else {
            return this.getLast(this.head as Node<T>);
        }
    };
}