import { Raycaster } from "three";


export interface InputStrategy {
  init(): void;
  onSelect(callback: (raycaster: Raycaster) => void): void;
  update(): void;
  destroy(): void;
}
