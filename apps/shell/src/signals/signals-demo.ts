// class ChangeDetiction {
//   private changesDectected: boolean = false;

//   myComponentChanged(componentId: number): void {
//     this.changesDectected = true;
//     this.updateZone();
//   }

//   private updateZone(): void {
//     if (this.changesDectected) {
//       console.log('Changes detected in component');
//       this.changesDectected = false;
//     }
//   }

// }



type UpdateableSignal<T> = {
  (): T;
  set(value: T): void;
  update(fn: (newValue: T) => T): void;
};

function createSignal<T>(initialValue: T): UpdateableSignal<T> {
  let value = initialValue;

  const signal: UpdateableSignal<T> = () => value;

  signal.set = (newValue: T) => {
    value = newValue;
  };

  signal.update = (fn: (newValue: T) => T) => {
    value = fn(value);
  };

  return signal;
}

