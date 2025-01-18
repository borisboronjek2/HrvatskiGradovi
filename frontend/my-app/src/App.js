import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [gradovi, setGradovi] = useState([]);
  
  useEffect(() => {
    const fetchGradovi = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/gradovi');
        setGradovi(response.data);
      } catch (error) {
        console.error('Greška prilikom dohvaćanja podataka:', error);
      }
    };

    fetchGradovi();
  }, []);
}

export default App;