export const dateDifference = (startDate: Date, endDate: Date) => {
  const timeDifference = endDate.getTime() - startDate.getTime()

  const seconds = Math.floor(timeDifference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const remainingHours = hours % 24
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  return {
    days: days,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  }
}
