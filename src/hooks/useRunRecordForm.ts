import { useState } from 'react';

type PickerType = 'distance' | 'time' | null;

export const useRunRecordForm = () => {
  const [distance, setDistance] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);

  const [activePicker, setActivePicker] = useState<PickerType>(null);

  const [distanceValue, setDistanceValue] = useState<number>(5.0);
  const [hourValue, setHourValue] = useState<number>(0);
  const [minuteValue, setMinuteValue] = useState<number>(40);
  const [secondValue, setSecondValue] = useState<number>(0);

  const [isClosing, setIsClosing] = useState(false);

  const openPicker = (type: 'distance' | 'time') => {
    if (type === 'distance') {
      setDistanceValue(distance ?? 5.0);
    } else {
      setHourValue(hours ?? 0);
      setMinuteValue(minutes ?? 40);
      setSecondValue(seconds ?? 0);
    }
    setActivePicker(type);
  };

  const applyPickerValues = () => {
    if (activePicker === 'distance') {
      setDistance(distanceValue);
    } else if (activePicker === 'time') {
      setHours(hourValue);
      setMinutes(minuteValue);
      setSeconds(secondValue);
    }
  };

  const closePicker = () => {
    setActivePicker(null);
    setIsClosing(false);
  };

  return {
    distance,
    hours,
    minutes,
    seconds,
    activePicker,
    distanceValue,
    setDistanceValue,
    hourValue,
    setHourValue,
    minuteValue,
    setMinuteValue,
    secondValue,
    setSecondValue,
    isClosing,
    setIsClosing,
    openPicker,
    applyPickerValues,
    closePicker,
  };
};
