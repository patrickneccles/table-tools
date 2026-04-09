/**
 * useHistory Hook
 *
 * Manages undo/redo history for any state value.
 */

import { useCallback, useRef, useState } from 'react';

type HistoryFlags = { canUndo: boolean; canRedo: boolean };

export type UseHistoryReturn<T> = {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  reset: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  captureSnapshot: () => void;
  clear: () => void;
};

export function useHistory<T>(initialState: T, maxHistory: number = 50): UseHistoryReturn<T> {
  const [state, setStateInternal] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const currentIndexRef = useRef(0);

  // Track if we're in the middle of an undo/redo operation
  const isUndoRedoRef = useRef(false);

  const recomputeFlags = (): HistoryFlags => ({
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
  });

  const [flags, setFlags] = useState<HistoryFlags>(() => ({
    canUndo: false,
    canRedo: false,
  }));

  const updateFlags = useCallback(() => {
    setFlags(recomputeFlags());
  }, []);

  const captureSnapshot = useCallback(() => {
    if (isUndoRedoRef.current) return;

    const currentHistory = historyRef.current;
    const currentIndex = currentIndexRef.current;

    // Remove any "future" history if we're not at the end
    const newHistory = currentHistory.slice(0, currentIndex + 1);

    // Add new state
    newHistory.push(state);

    // Limit history size
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    } else {
      currentIndexRef.current++;
    }

    historyRef.current = newHistory;
    updateFlags();
  }, [state, maxHistory, updateFlags]);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      const nextState =
        typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState;
      return nextState;
    });
  }, []);

  const undo = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      currentIndexRef.current = currentIndex - 1;
      setStateInternal(historyRef.current[currentIndex - 1]);
      updateFlags();
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [updateFlags]);

  const redo = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    const historyLength = historyRef.current.length;
    if (currentIndex < historyLength - 1) {
      isUndoRedoRef.current = true;
      currentIndexRef.current = currentIndex + 1;
      setStateInternal(historyRef.current[currentIndex + 1]);
      updateFlags();
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [updateFlags]);

  const reset = useCallback(
    (newState: T) => {
      historyRef.current = [newState];
      currentIndexRef.current = 0;
      setStateInternal(newState);
      updateFlags();
    },
    [updateFlags]
  );

  const clear = useCallback(() => {
    historyRef.current = [state];
    currentIndexRef.current = 0;
    updateFlags();
  }, [state, updateFlags]);

  const { canUndo, canRedo } = flags;

  return {
    state,
    setState,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    captureSnapshot,
    clear,
  };
}
