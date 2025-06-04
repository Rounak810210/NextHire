import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RoadmapPage.module.css';

interface Topic {
  title: string;
  items: string[];
}

interface Resource {
  books: string[];
  online_courses: string[];
  practice_platforms: string[];
}

interface Roadmap {
  id: number;
  role: string;
  title: string;
  description: string;
  topics: Record<string, Topic>;
  resources: Resource;
}

const RoadmapPage: React.FC<{ role: string }> = ({ role }) => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('fundamentals');

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/roadmap/${role}`);
        setRoadmap(response.data);
      } catch (err) {
        setError('Failed to load roadmap');
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [role]);

  if (loading) {
    return <div className={styles.loading}>Loading roadmap...</div>;
  }

  if (error || !roadmap) {
    return <div className={styles.error}>{error || 'Failed to load roadmap'}</div>;
  }

  return (
    <div className={styles.roadmapContainer}>
      <div className={styles.header}>
        <h1>{roadmap.title}</h1>
        <p className={styles.description}>{roadmap.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h2>Topics</h2>
          <nav className={styles.topicNav}>
            {Object.entries(roadmap.topics).map(([key, topic]) => (
              <button
                key={key}
                className={`${styles.topicButton} ${activeSection === key ? styles.active : ''}`}
                onClick={() => setActiveSection(key)}
              >
                {topic.title}
              </button>
            ))}
          </nav>

          <div className={styles.resources}>
            <h2>Learning Resources</h2>
            <div className={styles.resourceSection}>
              <h3>📚 Recommended Books</h3>
              <ul>
                {roadmap.resources.books.map((book, index) => (
                  <li key={index}>{book}</li>
                ))}
              </ul>
            </div>
            <div className={styles.resourceSection}>
              <h3>💻 Online Courses</h3>
              <ul>
                {roadmap.resources.online_courses.map((course, index) => (
                  <li key={index}>{course}</li>
                ))}
              </ul>
            </div>
            <div className={styles.resourceSection}>
              <h3>🎯 Practice Platforms</h3>
              <ul>
                {roadmap.resources.practice_platforms.map((platform, index) => (
                  <li key={index}>{platform}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.topicContent}>
            <h2>{roadmap.topics[activeSection].title}</h2>
            <div className={styles.topicItems}>
              {roadmap.topics[activeSection].items.map((item, index) => (
                <div key={index} className={styles.topicItem}>
                  <div className={styles.itemNumber}>{index + 1}</div>
                  <div className={styles.itemContent}>
                    <h3>{item}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage; 