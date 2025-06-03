import React, { useState } from 'react'
import './App.css'
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { CgSpinner } from 'react-icons/cg';

// Heart shape pattern (11x9 grid)
const HEART_GRID = [
  [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
];
const findContrastColor = (color: string) => {
  const rgb = color.replace('#', '').match(/.{1,2}/g)?.map((x) => parseInt(x, 16));
  const yiq = ((rgb![0] * 299) + (rgb![1] * 587) + (rgb![2] * 114)) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
function App() {
  const [images, setImages] = useState<(string | null)[][]>(
    HEART_GRID.map(row => row.map(cell => null))
  );
  const heartRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null)

  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [title, setTitle] = useState<string>('top fl');

  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    setLoading(true);
    const scale = 5;
    heartRef.current!.style.transform = `scale(${scale})`;
    titleRef.current!.style.fontSize = `2rem`;

    if (!heartRef.current) return;

    try {
      const canvas = await html2canvas(heartRef.current);

      const link = document.createElement('a');
      link.download = title ? `${title}.png` : 'heart-grid.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
    heartRef.current!.style.transform = `scale(1)`;
    titleRef.current!.style.fontSize = `2rem`;
    setLoading(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        setImages(prevImages => {
          const newImages = prevImages.map(row => [...row]);
          let found = false;

          // Find the first empty cell in the heart shape
          for (let i = 0; i < HEART_GRID.length && !found; i++) {
            for (let j = 0; j < HEART_GRID[0].length && !found; j++) {
              if (HEART_GRID[i][j] === 1 && !newImages[i][j]) {
                newImages[i][j] = imageUrl;
                found = true;
              }
            }
          }
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (row: number, col: number) => {
    const newImages = [...images];
    newImages[row][col] = null;
    setImages(newImages);
  };

  return (
    <div className="App">
      {loading && <div className='fixed top-0 left-0 w-full h-full bg-gray-300 z-50 flex items-center justify-center'>
        <CgSpinner size={32} className="animate-spin me-2" /> <p>loading...</p>
      </div>}
      <div className="upload-container">

        <div className='grid gap-2 w-full max-w-xl bg-gray-100 p-4 rounded-md'>
          <p>pilih hingga {HEART_GRID.flat().filter(cell => cell === 1).length} gambar</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className='border rounded-md p-2 bg-white text-xs w-full'
          />
        </div>
        <div className="grid gap-2 w-full max-w-xl bg-gray-100 p-4 rounded-md">
          <p className='font-bold text-lg'>Pengaturan</p>
          <label htmlFor="backgroundColor">warna latar</label>
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          <label htmlFor="title">Judul (opsional)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className='border rounded-md p-2 bg-white' />
        </div>
        <div className="heart-grid" ref={heartRef} style={{ backgroundColor: backgroundColor }}>
          <p ref={titleRef} style={{ color: findContrastColor(backgroundColor) }} className="font-bold text-center text-[2rem] mb-8">{title}</p>
          {HEART_GRID.map((row, rowIndex) => (
            <div key={rowIndex} className="heart-row">
              {row.map((cell, colIndex) => (
                cell === 1 ? (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`heart-cell ${images[rowIndex][colIndex] ? 'filled' : ''}`}
                    onClick={() => images[rowIndex][colIndex] && handleRemoveImage(rowIndex, colIndex)}
                  >
                    {images[rowIndex][colIndex] && (
                      <img
                        src={images[rowIndex][colIndex] as string}
                        alt={`Heart piece ${rowIndex}-${colIndex}`}
                        className="heart-image"
                      />
                    )}
                  </div>
                ) : (
                  <div key={`${rowIndex}-${colIndex}`} className="empty-cell" />
                )
              ))}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-2 gap-2 w-full max-w-xl *:w-full'>
          <button className="bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded-md"
            onClick={() => setImages(HEART_GRID.map(row => row.map(cell => null)))}>Kosongkan</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            onClick={handleDownload}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

export default App