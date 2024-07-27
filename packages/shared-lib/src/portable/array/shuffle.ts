function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array];

  for (let currentIndex = shuffledArray.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [(shuffledArray as any)[currentIndex], (shuffledArray as any)[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[currentIndex]];
  }

  return shuffledArray;
}

export default shuffleArray;
