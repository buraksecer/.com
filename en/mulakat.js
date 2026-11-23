const interview = [
  [
    "How would you combine Strangler Fig and an Anti-Corruption Layer?",
    "I would start with an isolated workflow and route its traffic to the new service. Strangler Fig lets us replace the old system incrementally. An Anti-Corruption Layer translates legacy contracts into the new domain model. I would measure errors and latency on both paths and keep a rollback route."
  ],
  [
    "When do you need a distributed lock and what happens if its lease expires?",
    "I first consider a unique constraint (a database rule that prevents duplicates) or optimistic concurrency (checking whether a record changed before writing). If a lock is necessary, I use a time-limited lease. A fencing token (a monotonically increasing number) lets the storage system reject writes from an old worker after another worker acquires the lock."
  ],
  [
    "How do you make an API request idempotent?",
    "I scope an idempotency key to the customer and operation. The same key with the same payload returns the previous result. A different payload is rejected. I persist the outcome and key in one transaction where possible. For external calls I propagate the key or reconcile the outcomes between systems."
  ],
  [
    "How do you handle a successful database update followed by a failed event publication?",
    "I write the business change and an outbox record (an event waiting to be published) in one transaction. A worker publishes committed records. A crash after publication can cause duplicates, so consumers deduplicate by event ID and check versions when order matters."
  ],
  [
    "How do retries and dead-letter queues work together?",
    "I retry transient failures with bounded exponential backoff and jitter (small random delays). Malformed events go to a dead-letter queue. For hourly reports I advance the offset only after the result is durable. The failed event retains its error and reporting window so we can safely reprocess it."
  ],
  [
    "How do you choose a partition key for event streaming?",
    "I identify the scope that requires ordering. An order ID keeps an order’s events together. I test distribution against actual traffic, since a dominant customer can create a hot partition. I track consumer lag separately for each partition."
  ],
  [
    "How do circuit breakers and retries interact?",
    "Retry handles transient failures. A circuit breaker temporarily stops calls to a persistently failing dependency. I set an end-to-end time budget and keep retries in one layer to avoid multiplying load. When the breaker opens I return a suitable fallback or fail quickly."
  ],
  [
    "How do you design compensation for a saga?",
    "Each service commits its own transaction. If a later step fails, I compensate with a business operation such as releasing reserved inventory. Compensation can fail too, so I store its state durably, make it idempotent and surface cases that need manual review."
  ],
  [
    "How do you approach cache invalidation?",
    "I start with the maximum acceptable staleness. With cache-aside I invalidate the key after the write commits, set an expiry and protect frequently accessed keys from simultaneous cache misses. Authorization decisions may have stricter freshness requirements."
  ],
  [
    "A production SQL query slowed down. Where do you start?",
    "I check whether the problem is isolated or affects the database broadly. I examine the execution plan, waits and rows read. Before adding an index, I study filters and data distribution. I measure the improvement with representative data and account for the write overhead."
  ],
  [
    "When does SQL partitioning help?",
    "It can help manage large time-based tables and queries that filter on the partition key. Partition elimination skips irrelevant segments. I check the query plan and maintenance cost. The indexes still need to support the actual query patterns."
  ],
  [
    "How do you design cursor pagination?",
    "I use a deterministic sort, for example creation time plus a unique ID. The cursor stores the last record’s sort values and the next page reads after them. I use an aligned index and consider a snapshot or fixed upper bound when results must stay stable."
  ],
  [
    "How should a consumer handle a duplicate message?",
    "A worker may have saved the result and crashed before acknowledgment. I store the event ID and result in one transaction, then acknowledge the message. An external call needs its own idempotency key or a way to verify the outcome before retrying."
  ],
  [
    "When do you choose optimistic concurrency over pessimistic locking?",
    "With rare conflicts I use an optimistic version check and reload stale records. A short operation with frequent conflicts may justify taking a lock first. I measure lock duration, deadlock risk and the impact on throughput."
  ],
  [
    "Which metrics do you look at when a service slows down?",
    "I start with p95 and p99 latency, error rate and request volume. Traces help identify the affected endpoint or dependency. For event processors I check consumer lag and the last successful processing time. Dashboards should show both customer impact and the location of the bottleneck."
  ],
  [
    "How do you apply backpressure?",
    "I bound the queue and the number of concurrent jobs. When capacity is reached, I reject, slow or redirect work based on its priority. I track both queue depth and the age of the oldest job to distinguish bursts from sustained overload."
  ],
  [
    "How do you release a database change without downtime?",
    "I deploy a schema change compatible with the old application. Then I release the new code and backfill in small batches if necessary. I compare old and new results before switching the read path. I remove the old column or contract after all consumers have migrated."
  ],
  [
    "How do you safely deploy software to a physical device?",
    "A controller waits until any active operation finishes and enters maintenance mode. It unpacks and verifies the new release in a separate directory before restarting. I design a health check and a rollback path to the previous version if startup fails."
  ],
  [
    "How do you evolve an event schema without breaking consumers?",
    "I check that older consumers can read new messages. I add optional fields where possible and keep existing meanings intact. Breaking changes get a new version. I monitor adoption and retire the old version after all consumers migrate."
  ],
  [
    "How do you justify a technical decision in an RFC?",
    "I document the product goal and measurable constraints, then compare options by operational cost, failure modes and integration risk. I specify when to revisit the decision, break the implementation into verifiable tasks and monitor the result after release."
  ]
];

const progress = document.querySelector('#progress');
const question = document.querySelector('#question');
const answer = document.querySelector('#answer');
const response = document.querySelector('#response');
const next = document.querySelector('#next');
const skip = document.querySelector('#skip');
let index = 0;
let frame;

function finish() {
  cancelAnimationFrame(frame);
  [question.textContent, response.textContent] = interview[index];
  answer.hidden = false;
  skip.hidden = true;
  next.hidden = false;
}

function showTurn() {
  const [prompt, reply] = interview[index];
  progress.textContent = (index + 1) + ' / ' + interview.length;
  question.textContent = '';
  response.textContent = '';
  answer.hidden = true;
  next.hidden = true;
  next.textContent = index === interview.length - 1 ? 'Restart ↻' : 'Next question →';
  skip.hidden = false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finish();
    return;
  }
  const start = performance.now();
  const answerStart = prompt.length * 23 + 450;
  function type(now) {
    const elapsed = now - start;
    question.textContent = prompt.slice(0, elapsed / 23);
    if (elapsed >= answerStart) {
      answer.hidden = false;
      response.textContent = reply.slice(0, (elapsed - answerStart) / 9);
      if (response.textContent === reply) {
        finish();
        return;
      }
    }
    frame = requestAnimationFrame(type);
  }
  frame = requestAnimationFrame(type);
}

skip.onclick = () => {
  finish();
  next.focus();
};
next.onclick = () => {
  index = (index + 1) % interview.length;
  showTurn();
  window.scrollTo(0, 0);
  (next.hidden ? skip : next).focus();
};
showTurn();
