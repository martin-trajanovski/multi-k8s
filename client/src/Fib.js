import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Fib = () => {
  const [values, setValues] = useState({});
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [index, setIndex] = useState('');
  const [loadingValues, setLoadingValues] = useState(true);
  const [loadingIndexes, setLoadingIndexes] = useState(true);

  useEffect(() => {
    let unmounted = false;

    const fetchValues = async () => {
      const values = await axios.get('/api/values/current');

      if (unmounted) {
        return;
      }

      setValues(values.data);
      setLoadingValues(false);
    };

    const fetchIndexes = async () => {
      const fetchedIndexes = await axios.get('/api/values/all');

      if (unmounted) {
        return;
      }

      setSeenIndexes(fetchedIndexes.data);
      setLoadingIndexes(false);
    };

    fetchValues();
    fetchIndexes();

    return () => {
      unmounted = true;
    };
  }, []);

  if (loadingIndexes || loadingValues) {
    return <div data-testid="loader">Loading...</div>;
  }

  const renderSeenIndexes = () => {
    return seenIndexes.map(({ number }) => number).join(',');
  };

  const renderValues = () => {
    const entries = [];

    for (const key in values) {
      if (Object.hasOwnProperty.call(values, key)) {
        const element = values[key];

        entries.push(
          <div key={key}>
            For index {key} I calculated {element}
          </div>
        );
      }
    }

    return entries;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post('/api/values', {
      index,
    });

    setIndex('');
  };

  const handleChange = (event) => {
    setIndex(event.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          value={index}
          onChange={handleChange}
          data-testid="fibonacci-index-input"
        />

        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>

      <h3>Seen indexes:</h3>
      <div>{renderSeenIndexes()}</div>

      <h3>Calculated values:</h3>
      <div>{renderValues()}</div>
    </div>
  );
};

export default Fib;
