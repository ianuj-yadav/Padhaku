export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  course: string;
  semester: string;
  subjects: string[];
  avatar: string;
  streakDays: number;
  xp: number;
  verified: boolean;
}

export interface NoteItem {
  id: string;
  notebookId: string;
  subject: string;
  unit: string;
  title: string;
  content: string;
  tags: string[];
  favourite: boolean;
  updatedAt: string;
  versions: { timestamp: string; summary: string }[];
}

export interface NotebookFolder {
  id: string;
  subject: string;
  color: string;
  icon: string;
  units: string[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  subject: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  keywords: string[];
}

export interface StudyDocument {
  id: string;
  title: string;
  subject: string;
  fileType: 'PDF' | 'OCR_SCAN' | 'DOCX' | 'PPTX';
  pages: number;
  uploadedAt: string;
  size: string;
  versionHash: string;
  summary: string;
  importantTopics: { topic: string; mastery: number; description: string }[];
  examQuestions: { question: string; marks: number; difficulty: 'Easy' | 'Medium' | 'Hard'; answerOutline: string }[];
  ocrRawText?: string;
}

export interface FlashcardItem {
  id: string;
  subject: string;
  documentId?: string;
  front: string;
  back: string;
  intervalDays: number;
  easeFactor: number;
  dueLabel: string;
  lastRating?: 'Again' | 'Hard' | 'Good' | 'Easy';
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'True/False' | 'Short Answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  sourcePage: string;
}

export interface StudySessionMeeting {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  mode: 'P2P WebRTC Mesh (1-4)' | 'LiveKit SFU (Group)' | 'Google Meet';
  meetUrl: string;
  host: string;
  isLive?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  aiGenerated?: boolean;
}

export const INITIAL_USER: UserProfile = {
  id: 'usr_anuj_01',
  name: 'Anuj Sharma',
  email: 'anuj.sharma@ntcc.edu.in',
  university: 'Amity / NTCC University',
  course: 'B.Tech Computer Science & Engineering',
  semester: 'Semester 5',
  subjects: [
    'Operating Systems',
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Computer Networks',
  ],
  avatar: 'AS',
  streakDays: 14,
  xp: 2840,
  verified: true,
};

export const INITIAL_NOTEBOOKS: NotebookFolder[] = [
  {
    id: 'nb_dsa',
    subject: 'Data Structures & Algorithms',
    color: '#6366f1',
    icon: 'GitBranch',
    units: ['Arrays & Hashing', 'Linked Lists', 'Trees & BST', 'Graphs & Shortest Path'],
  },
  {
    id: 'nb_os',
    subject: 'Operating Systems',
    color: '#8b5cf6',
    icon: 'Cpu',
    units: ['Unit 1: Kernel & Processes', 'Unit 2: CPU Scheduling', 'Unit 3: Process Synchronization', 'Unit 4: Deadlocks & Memory'],
  },
  {
    id: 'nb_dbms',
    subject: 'Database Management Systems',
    color: '#ec4899',
    icon: 'Database',
    units: ['Unit 1: ER Modeling', 'Unit 2: Relational Algebra & SQL', 'Unit 3: Normalization & ACID', 'Unit 4: B+ Trees & Indexing'],
  },
  {
    id: 'nb_cn',
    subject: 'Computer Networks',
    color: '#10b981',
    icon: 'Network',
    units: ['OSI & TCP/IP Stack', 'Data Link & MAC', 'Routing Algorithms (OSPF/BGP)', 'Transport Layer & Congestion'],
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note_bst',
    notebookId: 'nb_dsa',
    subject: 'Data Structures & Algorithms',
    unit: 'Trees & BST',
    title: 'Binary Search Tree & AVL Balancing',
    content: `# Binary Search Tree (BST)

## Core Invariant
Every node $u$ in a **Binary Search Tree** satisfies the strict ordering property:
- Every key in the **left subtree** is strictly less than $u.key$.
- Every key in the **right subtree** is strictly greater than $u.key$.

\`\`\`python
class TreeNode:
    def __init__(self, key: int):
        self.key = key
        self.left = None
        self.right = None

def search_bst(root: TreeNode | None, target: int) -> TreeNode | None:
    if not root or root.key == target:
        return root
    if target < root.key:
        return search_bst(root.left, target)
    return search_bst(root.right, target)
\`\`\`

## Time Complexity Summary
| Operation | Average Case | Worst Case (Skewed) | AVL Balanced |
| :--- | :--- | :--- | :--- |
| Search | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ |
| Insertion | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ |
| Deletion | $O(\\log n)$ | $O(n)$ | $O(\\log n)$ |

> **Exam Tip:** Always check whether the tree can degenerate into a linked list on sorted input $[1, 2, 3, 4, 5]$. Use **AVL Rotations (LL, RR, LR, RL)** or **Red-Black Trees** to maintain height $O(\\log n)$.`,
    tags: ['DSA', 'Trees', 'BST', 'AVL', 'High-Yield'],
    favourite: true,
    updatedAt: '10 mins ago',
    versions: [
      { timestamp: 'Today, 18:30', summary: 'Added AVL rotation complexity table' },
      { timestamp: 'Yesterday, 21:15', summary: 'Initial lecture notes from Prof. Verma' },
    ],
  },
  {
    id: 'note_dijkstra',
    notebookId: 'nb_dsa',
    subject: 'Data Structures & Algorithms',
    unit: 'Graphs & Shortest Path',
    title: "Dijkstra's Shortest Path & Priority Queues",
    content: `# Dijkstra's Algorithm (Single-Source Shortest Path)

## Intuition
Dijkstra's algorithm greedily relaxes edges from the unvisited vertex with the minimum tentative distance using a **Min-Heap (Priority Queue)**.

### Key Constraint
- Works ONLY on graphs with **non-negative edge weights** ($w(u, v) \\ge 0$).
- If negative weight edges exist, use **Bellman-Ford** ($O(VE)$) instead.

### Complexity
Using Binary Min-Heap + Adjacency List:
$$T(V, E) = O((V + E) \\log V)$$

\`\`\`python
import heapq

def dijkstra(graph: dict[int, list[tuple[int, int]]], src: int, n: int):
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist
\`\`\``,
    tags: ['Graphs', 'Greedy', 'Shortest-Path', 'Placement'],
    favourite: true,
    updatedAt: '2 hours ago',
    versions: [
      { timestamp: 'Today, 16:40', summary: 'Added Python heapq implementation' },
    ],
  },
  {
    id: 'note_os_sync',
    notebookId: 'nb_os',
    subject: 'Operating Systems',
    unit: 'Unit 3: Process Synchronization',
    title: 'Semaphores, Mutex & Critical Section Problem',
    content: `# Process Synchronization — Unit 3

## The Critical Section Problem
When concurrent processes access shared memory or kernel structures simultaneously, a **Race Condition** occurs if the final outcome depends on the exact interleaving of execution.

### 3 Mandatory Conditions for a Valid Solution:
1. **Mutual Exclusion**: Only one process can execute inside its Critical Section at any instant.
2. **Progress**: If no process is in the critical section and some wish to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting**: There must exist a strict bound on the number of times other processes are allowed to enter their critical sections after a process has made a request.

## Semaphore vs Mutex
- **Mutex**: Locking mechanism with strict ownership (only the thread that locked it can unlock it). Binary state (0 or 1).
- **Counting Semaphore**: Signaling mechanism initialized to $N$ available resources. Uses atomic \`wait(S)\` ($P$) and \`signal(S)\` ($V$) operations.`,
    tags: ['OS', 'Synchronization', 'Semaphore', 'Exam-Core'],
    favourite: true,
    updatedAt: 'Yesterday',
    versions: [
      { timestamp: 'Yesterday, 14:20', summary: 'Added Peterson solution & Semaphore comparison' },
    ],
  },
  {
    id: 'note_dbms_acid',
    notebookId: 'nb_dbms',
    subject: 'Database Management Systems',
    unit: 'Unit 3: Normalization & ACID',
    title: 'ACID Properties, Serializability & 2PL',
    content: `# Transactions & Concurrency Control (DBMS)

## ACID Guarantees
- **Atomicity**: All-or-nothing execution managed via Write-Ahead Logging (WAL) and UNDO logs.
- **Consistency**: Integrity constraints hold before and after the transaction.
- **Isolation**: Concurrent execution produces the same state as some serial execution order.
- **Durability**: Committed changes survive power loss via REDO logs.

## Conflict Serializability
Test using a **Precedence Graph**:
- Nodes = Active Transactions $T_1, T_2, \\dots, T_k$
- Directed edge $T_i \\to T_j$ if conflicting operations on item $X$ (at least one \`WRITE\`) execute in $T_i$ before $T_j$.
- Schedule is **Conflict Serializable** iff the precedence graph is a **DAG (No Cycles)**.`,
    tags: ['DBMS', 'ACID', 'Transactions', '2PL'],
    favourite: false,
    updatedAt: '3 days ago',
    versions: [{ timestamp: '3 days ago', summary: 'Created DBMS Unit 3 notes' }],
  },
];

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc_os_unit3',
    title: 'Operating_System_Unit_3.pdf',
    subject: 'Operating Systems',
    fileType: 'PDF',
    pages: 48,
    uploadedAt: '2 days ago',
    size: '4.2 MB',
    versionHash: 'sha256:8f9c2b1e',
    summary:
      'Process synchronization prevents multiple concurrent processes from corrupting shared kernel or user data structures. Covers the Critical Section problem, Peterson’s two-process software solution, hardware atomic instructions (TestAndSet, CompareAndSwap), Counting and Binary Semaphores, Mutex locks, Monitors, and classical synchronization problems (Producer-Consumer, Readers-Writers, Dining Philosophers).',
    importantTopics: [
      { topic: 'Semaphore (Wait & Signal)', mastery: 88, description: 'Integer variable accessed only via atomic P() and V() operations to coordinate resource access.' },
      { topic: 'Mutex vs Binary Semaphore', mastery: 92, description: 'Ownership-based locking mechanism vs signaling mechanism across threads.' },
      { topic: 'Critical Section Problem', mastery: 85, description: 'Requires Mutual Exclusion, Progress, and Bounded Waiting.' },
      { topic: 'Deadlock & Starvation', mastery: 62, description: 'Circular wait across processes holding non-preemptible locks.' },
      { topic: 'Race Condition', mastery: 94, description: 'Non-deterministic state corruption due to unsynchronized concurrent writes.' },
    ],
    examQuestions: [
      {
        question: 'Explain counting and binary semaphores with a Producer-Consumer bounded-buffer C/pseudocode example.',
        marks: 10,
        difficulty: 'Medium',
        answerOutline: 'Define atomic wait(S) and signal(S). Show mutex = 1, empty = N, full = 0 semaphores protecting buffer[] manipulations.',
      },
      {
        question: 'Differentiate between a Mutex lock and a Counting Semaphore. Can a binary semaphore experience priority inversion?',
        marks: 5,
        difficulty: 'Medium',
        answerOutline: 'Contrast thread ownership in Mutex vs signaling in Semaphore; explain priority inheritance protocol for priority inversion.',
      },
      {
        question: 'State and prove how Peterson’s solution satisfies Mutual Exclusion, Progress, and Bounded Waiting for two processes.',
        marks: 10,
        difficulty: 'Hard',
        answerOutline: 'Use shared variables turn and flag[2]. Show both processes cannot enter CS simultaneously because turn holds a single scalar value.',
      },
    ],
  },
  {
    id: 'doc_os_deadlock',
    title: 'Deadlock_Notes.pdf',
    subject: 'Operating Systems',
    fileType: 'PDF',
    pages: 24,
    uploadedAt: 'Yesterday',
    size: '2.1 MB',
    versionHash: 'sha256:4a1d7c93',
    summary:
      'Comprehensive guide to Deadlock characterization, Resource Allocation Graphs (RAG), Coffman’s four necessary conditions, Deadlock Prevention, Banker’s Algorithm for Deadlock Avoidance, and Recovery strategies (process termination vs resource preemption).',
    importantTopics: [
      { topic: 'Coffman’s 4 Conditions', mastery: 90, description: 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.' },
      { topic: 'Banker’s Safety Algorithm', mastery: 68, description: 'Checks if a safe sequence <P1, P2, ... Pn> exists using Need[i] <= Work.' },
      { topic: 'Resource Allocation Graph', mastery: 80, description: 'Single instance cycle implies deadlock; multi-instance cycle is necessary but not sufficient.' },
    ],
    examQuestions: [
      {
        question: 'What are the four necessary conditions for a deadlock to occur? How can we prevent Circular Wait in practice?',
        marks: 8,
        difficulty: 'Easy',
        answerOutline: 'List Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Impose a strict total ordering on resource types R1 < R2 < ... < Rm.',
      },
      {
        question: 'Given Allocation, Max, and Available matrices for 5 processes and 3 resource types (A=10, B=5, C=7), compute the Need matrix and find the safe sequence.',
        marks: 10,
        difficulty: 'Hard',
        answerOutline: 'Need[i][j] = Max[i][j] - Allocation[i][j]. Run Safety Algorithm step-by-step to derive <P1, P3, P4, P0, P2>.',
      },
    ],
  },
  {
    id: 'doc_dsa_graphs',
    title: 'DSA_Trees_And_Graphs.pdf',
    subject: 'Data Structures & Algorithms',
    fileType: 'PDF',
    pages: 64,
    uploadedAt: '4 days ago',
    size: '5.8 MB',
    versionHash: 'sha256:c309e412',
    summary:
      'Covers Binary Search Trees, AVL self-balancing rotations, Heap priority queues, Graph representations (Adjacency Matrix vs List), BFS, DFS, Topological Sort (Kahn’s algorithm), Dijkstra’s shortest path, Bellman-Ford, and Kruskal/Prim Minimum Spanning Trees.',
    importantTopics: [
      { topic: 'Dijkstra Shortest Path', mastery: 91, description: 'Greedy edge relaxation using Min-Heap in O((V+E) log V).' },
      { topic: 'AVL Tree Rotations', mastery: 76, description: 'Maintains balance factor in {-1, 0, 1} using LL, RR, LR, RL rotations.' },
      { topic: 'DFS & Cycle Detection', mastery: 84, description: 'Uses recursion stack / 3-color marking (White, Gray, Black) in directed graphs.' },
    ],
    examQuestions: [
      {
        question: 'Why does Dijkstra’s algorithm fail on graphs with negative-weight edges? Illustrate with a 3-vertex counterexample.',
        marks: 6,
        difficulty: 'Medium',
        answerOutline: 'Show greedy assumption breaks once a vertex is popped from Min-Heap and marked visited before encountering a negative edge.',
      },
    ],
  },
  {
    id: 'doc_ocr_handwritten',
    title: 'Handwritten_OS_Page43_Scan.jpg',
    subject: 'Operating Systems',
    fileType: 'OCR_SCAN',
    pages: 3,
    uploadedAt: 'Just now',
    size: '1.4 MB',
    versionHash: 'sha256:ocr7721a',
    ocrRawText: `LECTURE 19: DEADLOCK & SEMAPHORE REVISION (Handwritten Scan - Page 43)
1. Deadlock Definition: A set of blocked processes each holding a resource and waiting to acquire a resource held by another process in the set.
2. Coffman Conditions (All 4 must hold simultaneously):
   (a) Mutual Exclusion   (b) Hold and Wait
   (c) No Preemption      (d) Circular Wait
3. Banker's Algorithm Formula:
   Need[i, j] = Max[i, j] - Allocation[i, j]
   Safety Condition: Finish[i] == false AND Need[i] <= Work`,
    summary:
      'Digitized via Padhaku Vision OCR + AI Cleanup from student handwritten notebook scan. Contains condensed formulas for Banker’s Algorithm (Need = Max - Allocation) and the 4 Coffman deadlock conditions.',
    importantTopics: [
      { topic: 'Handwritten Banker Formula', mastery: 89, description: 'Need[i,j] = Max[i,j] - Allocation[i,j] extracted from notebook scan.' },
    ],
    examQuestions: [
      {
        question: 'Write the safety condition inequality used in Banker’s Algorithm from your handwritten lecture notes.',
        marks: 4,
        difficulty: 'Easy',
        answerOutline: 'Finish[i] == false and Need[i] <= Work, followed by Work = Work + Allocation[i].',
      },
    ],
  },
];

export const INITIAL_DOCUMENT_CHUNKS: DocumentChunk[] = [
  {
    id: 'chk_os_42',
    documentId: 'doc_os_unit3',
    documentTitle: 'Operating_System_Unit_3.pdf',
    subject: 'Operating Systems',
    pageNumber: 42,
    chunkIndex: 1,
    content:
      'A Semaphore S is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait(S) (originally termed P) and signal(S) (originally termed V). In wait(S), while S <= 0 the process blocks; otherwise S is decremented. Counting semaphores control access to a resource with multiple instances, whereas binary semaphores range only between 0 and 1.',
    keywords: ['semaphore', 'wait', 'signal', 'atomic', 'binary', 'counting', 'synchronization', 'mutex'],
  },
  {
    id: 'chk_os_43',
    documentId: 'doc_os_unit3',
    documentTitle: 'Operating_System_Unit_3.pdf',
    subject: 'Operating Systems',
    pageNumber: 43,
    chunkIndex: 2,
    content:
      'Deadlock in Semaphore Implementation: The implementation of a semaphore with a waiting queue may result in a situation where two or more processes are waiting indefinitely for an event that can be caused only by one of the waiting processes. When Process P0 executes wait(S) and P1 executes wait(Q), and then P0 requests wait(Q) while P1 requests wait(S), a circular wait deadlock occurs.',
    keywords: ['deadlock', 'semaphore', 'waiting', 'queue', 'circular', 'indefinitely', 'p0', 'p1'],
  },
  {
    id: 'chk_deadlock_07',
    documentId: 'doc_os_deadlock',
    documentTitle: 'Deadlock_Notes.pdf',
    subject: 'Operating Systems',
    pageNumber: 7,
    chunkIndex: 1,
    content:
      'Necessary Conditions for Deadlock (Coffman Conditions): A deadlock situation can arise if and only if the following four conditions hold simultaneously in a system: (1) Mutual Exclusion: at least one resource must be held in a non-sharable mode. (2) Hold and Wait: a process must be holding at least one resource and waiting to acquire additional resources held by other processes. (3) No Preemption: resources cannot be forcibly preempted. (4) Circular Wait: a closed chain of processes {P0, P1, ..., Pn} exists.',
    keywords: ['deadlock', 'coffman', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'conditions'],
  },
  {
    id: 'chk_deadlock_14',
    documentId: 'doc_os_deadlock',
    documentTitle: 'Deadlock_Notes.pdf',
    subject: 'Operating Systems',
    pageNumber: 14,
    chunkIndex: 2,
    content:
      'Banker’s Algorithm for Deadlock Avoidance: When a new process enters the system, it must declare the maximum number of instances of each resource type that it may need. The Need matrix is calculated as Need[i][j] = Max[i][j] - Allocation[i][j]. The system is in a safe state if there exists a safe sequence <P1, P2, ..., Pn> where each process can satisfy its Need using currently Available + previously released resources.',
    keywords: ['banker', 'avoidance', 'safe state', 'safe sequence', 'need', 'allocation', 'max', 'deadlock'],
  },
  {
    id: 'chk_dsa_28',
    documentId: 'doc_dsa_graphs',
    documentTitle: 'DSA_Trees_And_Graphs.pdf',
    subject: 'Data Structures & Algorithms',
    pageNumber: 28,
    chunkIndex: 1,
    content:
      'Dijkstra’s Algorithm solves the single-source shortest-path problem on a weighted graph G = (V, E) for the case in which all edge weights are non-negative. By maintaining a priority queue (min-heap) of vertices keyed by their tentative d[v] values, Dijkstra achieves O((V + E) log V) time complexity. For Question 5 (Q5) on grid/network reachability with unweighted or cycle checks, Depth-First Search (DFS) or BFS traversal is used.',
    keywords: ['dijkstra', 'shortest path', 'graph', 'priority queue', 'min-heap', 'q5', 'dfs', 'bfs', 'weights'],
  },
  {
    id: 'chk_dsa_12',
    documentId: 'doc_dsa_graphs',
    documentTitle: 'DSA_Trees_And_Graphs.pdf',
    subject: 'Data Structures & Algorithms',
    pageNumber: 12,
    chunkIndex: 2,
    content:
      'Binary Search Tree (BST) & AVL Balancing: In a BST, all keys in the left subtree are smaller than the root and all keys in the right subtree are larger. Because skewed insertions degrade height to O(n), AVL trees enforce |height(left) - height(right)| <= 1 using four rotation types: Left-Left (LL), Right-Right (RR), Left-Right (LR), and Right-Left (RL).',
    keywords: ['bst', 'binary search tree', 'avl', 'rotation', 'balance factor', 'tree', 'height'],
  },
  {
    id: 'chk_ocr_01',
    documentId: 'doc_ocr_handwritten',
    documentTitle: 'Handwritten_OS_Page43_Scan.jpg',
    subject: 'Operating Systems',
    pageNumber: 43,
    chunkIndex: 1,
    content:
      'Handwritten Lecture 19 Scan (Page 43): Deadlock is a set of blocked processes each holding a resource and waiting to acquire a resource held by another process in the set. Banker’s formula: Need[i, j] = Max[i, j] - Allocation[i, j]. Safety condition requires Finish[i] == false and Need[i] <= Work.',
    keywords: ['handwritten', 'ocr', 'deadlock', 'banker', 'need', 'page 43', 'scan'],
  },
];

export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    subject: 'Operating Systems',
    documentId: 'doc_os_unit3',
    front: 'What is a Semaphore in Operating Systems, and what are its two atomic operations?',
    back: 'A Semaphore S is an integer synchronization variable accessed only through two indivisible atomic operations: wait(S) [P] which decrements S (or blocks if S <= 0), and signal(S) [V] which increments S and wakes a waiting process.',
    intervalDays: 3,
    easeFactor: 2.5,
    dueLabel: 'Due Today',
  },
  {
    id: 'fc_2',
    subject: 'Operating Systems',
    documentId: 'doc_os_deadlock',
    front: 'What are Coffman’s 4 Necessary Conditions for Deadlock?',
    back: '1. Mutual Exclusion (non-sharable resource)\n2. Hold and Wait (holding one while waiting for another)\n3. No Preemption (only voluntary release)\n4. Circular Wait (closed cycle P0 → P1 → ... → P0)',
    intervalDays: 1,
    easeFactor: 2.3,
    dueLabel: 'Due Now',
  },
  {
    id: 'fc_3',
    subject: 'Data Structures & Algorithms',
    documentId: 'doc_dsa_graphs',
    front: "Why does Dijkstra's shortest path algorithm fail with negative edge weights?",
    back: 'Dijkstra assumes that adding an edge to a path can never decrease its total weight. Once a vertex with minimum tentative distance is popped from the Min-Heap, it is finalized and never re-evaluated if a later negative edge offers a shorter path.',
    intervalDays: 5,
    easeFactor: 2.6,
    dueLabel: 'In 2 days',
  },
  {
    id: 'fc_4',
    subject: 'Database Management Systems',
    front: 'How do you test whether a concurrent transaction schedule is Conflict Serializable?',
    back: 'Construct a Precedence (Serialization) Graph with transactions as nodes and directed edges Ti → Tj for every R-W, W-R, or W-W conflict. The schedule is Conflict Serializable if and only if the graph has NO cycles (is a DAG).',
    intervalDays: 2,
    easeFactor: 2.4,
    dueLabel: 'Due Today',
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'qz_1',
    question: 'Which condition is NOT one of Coffman’s four necessary conditions for a deadlock to occur?',
    type: 'MCQ',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemptive Priority Scheduling',
      'Circular Wait',
    ],
    correctAnswer: 'Preemptive Priority Scheduling',
    explanation: 'Coffman’s four conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait (Deadlock_Notes.pdf, Page 7).',
    topic: 'Deadlock',
    sourcePage: 'Deadlock_Notes.pdf • Page 7',
  },
  {
    id: 'qz_2',
    question: 'In a semaphore implementation, if Process P0 executes wait(S) followed by wait(Q), and Process P1 executes wait(Q) followed by wait(S), what hazard can arise?',
    type: 'MCQ',
    options: [
      'Belady’s Anomaly',
      'Circular Wait Deadlock',
      'External Fragmentation',
      'Convoy Effect only',
    ],
    correctAnswer: 'Circular Wait Deadlock',
    explanation: 'When P0 holds S waiting for Q while P1 holds Q waiting for S, both block indefinitely in a circular wait deadlock (Operating_System_Unit_3.pdf, Page 43).',
    topic: 'Semaphore',
    sourcePage: 'Operating_System_Unit_3.pdf • Page 43',
  },
  {
    id: 'qz_3',
    question: 'True or False: A Mutex has a strict ownership concept where only the thread that acquired the lock is permitted to release it, whereas a Binary Semaphore can be signaled by a different process.',
    type: 'True/False',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Mutex is a locking primitive with thread ownership; a Semaphore is a signaling mechanism where any process may invoke signal(S) (Operating_System_Unit_3.pdf, Page 42).',
    topic: 'Semaphore',
    sourcePage: 'Operating_System_Unit_3.pdf • Page 42',
  },
  {
    id: 'qz_4',
    question: 'What is the time complexity of Dijkstra’s algorithm using a Binary Min-Heap and an Adjacency List representation?',
    type: 'MCQ',
    options: [
      'O(V²)',
      'O((V + E) log V)',
      'O(V · E)',
      'O(E log E + V²)',
    ],
    correctAnswer: 'O((V + E) log V)',
    explanation: 'Each vertex extraction takes O(log V) and each edge relaxation updates the heap in O(log V), totaling O((V + E) log V) (DSA_Trees_And_Graphs.pdf, Page 28).',
    topic: 'Dijkstra Shortest Path',
    sourcePage: 'DSA_Trees_And_Graphs.pdf • Page 28',
  },
  {
    id: 'qz_5',
    question: 'In Banker’s Algorithm, how is the remaining resource requirement matrix Need[i][j] computed?',
    type: 'MCQ',
    options: [
      'Need[i][j] = Allocation[i][j] - Max[i][j]',
      'Need[i][j] = Max[i][j] - Allocation[i][j]',
      'Need[i][j] = Available[j] + Allocation[i][j]',
      'Need[i][j] = Max[i][j] + Available[j]',
    ],
    correctAnswer: 'Need[i][j] = Max[i][j] - Allocation[i][j]',
    explanation: 'Need[i][j] represents how many more instances of resource j process i may still request to complete (Deadlock_Notes.pdf, Page 14).',
    topic: 'Deadlock',
    sourcePage: 'Deadlock_Notes.pdf • Page 14',
  },
];

export const INITIAL_MEETINGS: StudySessionMeeting[] = [
  {
    id: 'meet_1',
    title: 'Graph Theory & Shortest Path Revision',
    subject: 'Data Structures & Algorithms',
    date: 'Today • 30 July',
    time: '8:00 PM',
    participants: 4,
    maxParticipants: 6,
    mode: 'P2P WebRTC Mesh (1-4)',
    meetUrl: 'https://meet.google.com/pdh-grph-dsa',
    host: 'Anuj Sharma',
    isLive: true,
  },
  {
    id: 'meet_2',
    title: 'OS Unit 3 & 4 — Semaphores & Banker’s Problem Solving',
    subject: 'Operating Systems',
    date: 'Tomorrow',
    time: '6:30 PM',
    participants: 5,
    maxParticipants: 6,
    mode: 'Google Meet',
    meetUrl: 'https://meet.google.com/pdh-osyn-u34',
    host: 'Mehak Kaur',
    isLive: false,
  },
  {
    id: 'meet_3',
    title: 'Mock Placement Coding Cohort (Trees + DP)',
    subject: 'Placement Preparation',
    date: 'Saturday',
    time: '11:00 AM',
    participants: 14,
    maxParticipants: 25,
    mode: 'LiveKit SFU (Group)',
    meetUrl: 'https://meet.google.com/pdh-plcm-sfu',
    host: 'Rahul Verma',
    isLive: false,
  },
];

export const INITIAL_STUDY_TASKS: StudyTask[] = [
  {
    id: 'tsk_1',
    title: 'Revise Graph Theory Unit 2 & Dijkstra priority queue proof',
    subject: 'Data Structures & Algorithms',
    dueTime: 'Today • 5:00 PM',
    priority: 'High',
    completed: true,
  },
  {
    id: 'tsk_2',
    title: 'Complete DSA assignment Q5 (Cycle detection using DFS)',
    subject: 'Data Structures & Algorithms',
    dueTime: 'Today • 7:00 PM',
    priority: 'High',
    completed: false,
  },
  {
    id: 'tsk_3',
    title: 'Review 10 Operating Systems flashcards (Semaphores & Deadlocks)',
    subject: 'Operating Systems',
    dueTime: 'Today • 7:30 PM',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'tsk_4',
    title: 'Attend Live Study Session: Graph Theory Revision (8:00 PM)',
    subject: 'Data Structures & Algorithms',
    dueTime: 'Today • 8:00 PM',
    priority: 'High',
    completed: false,
  },
];
