export const getFormatedTime = (seconds:number) => {
    // Get the integer part of the seconds
  const totalSeconds = Math.floor(seconds);

  // Get the fractional part of the seconds and convert to milliseconds
  const milliseconds = Math.floor((seconds - totalSeconds) * 1000);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Format the result as min:sec:milisec
  const formattedTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  return formattedTime;
}