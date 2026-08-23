# React Hook Getter Pattern

Published September 27, 2021 by Paco Coursey. This is a local reference copy; the canonical article is [paco.me/writing/hook-getter](https://paco.me/writing/hook-getter).

The article explains a technique used by SWR to reduce React re-renders in shared object-like state. A proxy tracks which keys a component reads, and subscriptions trigger a re-render only when one of those tracked keys changes. The full local HTML reference includes the implementation and code examples.
