import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fit Z · Tu progreso, en movimiento',description:'Rutinas, entrenamiento y progreso físico en un solo lugar.',icons:{icon:'/favicon.svg'},manifest:'/manifest.json'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
