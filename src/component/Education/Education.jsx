import { ArrowDownRight, BookOpen } from 'lucide-react';
import './Education.css';

const EDUCATION = [
  { number: '01', title: 'BSc (Hons) Computer Science', institution: 'Sunway College / Birmingham University', years: '2024 — Present', current: true, description: 'Specializing in Artificial Intelligence. Building a foundation in software development, data analysis, and intelligent systems.', subjects: ['Artificial Intelligence', 'Software development', 'Data analysis'] },
  { number: '02', title: '+2 in Science', institution: 'Reliance International Academy', years: '2022 — 2024', description: 'Science and Computer Science, with a focus on logical problem solving and technical fundamentals.', subjects: ['Science', 'Computer Science', 'Problem solving'] },
  { number: '03', title: 'High School', institution: 'Paragon Public School', years: '2012 — 2022', description: 'Where an interest in Computer Science and Mathematics first became a curiosity for building things.', subjects: ['Computer Science', 'Mathematics'] },
];

export default function Education() {
  return (
    <section className="section education-section" id="education" aria-labelledby="education-heading">
      <div className="container education-layout">
        <div className="education-intro">
          <p className="section-label">03 / THE JOURNEY</p>
          <h2 id="education-heading" className="section-title">Never done<br /><span>learning.</span></h2>
          <p>The foundations, the questions,<br />and everything that comes next.</p>
          <div className="education-margin-note" aria-hidden="true"><BookOpen size={27} strokeWidth={1.5} /><span>Stay curious.<br />Keep going.</span><ArrowDownRight size={30} strokeWidth={1.5} /></div>
        </div>
        <ol className="education-list">
          {EDUCATION.map((item, index) => (
            <li key={item.number}>
              <details className="education-card" open={index === 0}>
                <summary>
                  <span className="education-card-meta mono"><span>{item.years}</span><span className="education-card-number">CHAPTER {item.number}</span></span>
                  <span className="education-card-title">{item.title}<span className="education-toggle" aria-hidden="true" /></span>
                  <span className="education-institution">{item.institution}</span>
                </summary>
                <div className="education-card-content">
                  {item.current && <span className="education-current mono"><span aria-hidden="true" />THE CURRENT CHAPTER</span>}
                  <p>{item.description}</p>
                  <ul aria-label="Areas of study">{item.subjects.map((subject) => <li key={subject}>{subject}</li>)}</ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
