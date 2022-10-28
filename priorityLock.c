typedef struct priorityLock {
  lock l; // lock protecting this data
  bool busy; // priority lock state
  int num_high_priorities;
  cv low_priority_cv;
  cv high_priority_cv;

  // such as state variables and condition variables
} PriorityLock;

void PriorityLock_Init(PriorityLock *p){
  lock_init(p->l);
  p->busy = false;
  p->num_high_priorities =0;
  cv_init(p->low_priority_cv);
  cv_init(p->high_priority_cv);  
}

void PriorityLock_Acquire(PriorityLock *p, bool priority){
  lock_acquire(p->l);
  // True if high priority, false if low priority
  if (!priority) {
    while (num_high_priorities > 0) {
       low_priority_cv.wait();
    }
  }
  // check state variables and wait if necessary
  // the bool signifies if the thread is high priority
  p->busy = true;
  lock_release(p->l);
  ASSERT(p->busy == true);
}

void PriorityLock_Release(PriorityLock *p){
  lock_acquire(p->l);
  // It must've been a high priority if the count is above 0
  if (num_high_priorities > 1) {
    num_high_priorities--;
    high_priority_cv.signal();
  } else { 
     if (num_high_priorities == 1) {
    num_high_priorities--;
  } 
  
  // release priority lock, waking up a waiter if any, 
  // such that the constraints listed above are followed
  lock_release(p->l);
}