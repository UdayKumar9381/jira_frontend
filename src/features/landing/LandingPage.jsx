import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, BarChart2, Users, Layout, ArrowRight } from 'lucide-react';
import './LandingPage.css';
import kietLogo from '../../assets/kiet-logo.png'; // Import the logo

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll to section on mount if hash is present
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <div className="landing-container">
            <div className="landing-bg-glow"></div>
            <div className="landing-bg-glow-2"></div>

            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={kietLogo} alt="KIET" style={{ height: '32px' }} />
                    KIET
                </div>
                <div className="landing-nav-links">
                    <a className="landing-nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</a>
                    <a className="landing-nav-link" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>About</a>
                </div>
                <div className="landing-nav-actions">
                    <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</a>
                    <a href="#" className="btn-get-started" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Get Started</a>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section">
                <div className="hero-badge">New: Team Insights 2.0 Available Now 🚀</div>

                <h1 className="hero-title">
                    Manage Projects <br />
                    <span>The KIET Way</span>
                </h1>

                <p className="hero-subtitle">
                    Streamline your workflow, collaborate seamlessly, and ship faster with the most intuitive project management tool built for modern teams.
                </p>

                <div className="hero-cta-group">
                    <a href="#" className="btn-hero-primary" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Start for free</a>
                    <a href="#" className="btn-hero-secondary" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>View Demo</a>
                </div>

                {/* Floating Elements (Visuals) */}
                <div className="floating-container">
                    <div className="floating-card card-1">
                        <div className="status-dot dot-green"></div>
                        <div>
                            <strong>Project Alpha launch</strong>
                            <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Completed 2 mins ago</div>
                        </div>
                    </div>

                    <div className="floating-card card-2">
                        <div className="status-dot dot-blue"></div>
                        <div>
                            <strong>New Team Member</strong>
                            <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Alex joined Design Team</div>
                        </div>
                    </div>

                    <div className="floating-card card-3">
                        <div className="status-dot dot-purple"></div>
                        <div>
                            <strong>Sprint Planning</strong>
                            <div style={{ fontSize: '0.8em', opacity: 0.7 }}>In Progress • 45% Done</div>
                        </div>
                    </div>
                    <div className="floating-card card-4">
                        <div className="status-dot dot-orange"></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} />
                            <span>Team Velocity +20%</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 700 }}>Features that empower teams</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', width: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Layout size={40} color="#6366f1" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Scrum & Kanban</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Visualize work with flexible boards. Customize workflow to match your team's style.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', width: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <BarChart2 size={40} color="#22d3ee" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Real-time Reporting</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Gain actionable insights into team performance with velocity charts and sprint reports.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', width: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Users size={40} color="#f472b6" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Team Collaboration</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Stay aligned with mentions, comments, and real-time notifications on every issue.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>About KIET</h2>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.8 }}>
                        KIET is designed to bring clarity to chaos. Whether you are a startup or an enterprise,
                        our mission is to provide a seamless, powerful, and beautiful workspace where ideas turn into reality.
                        Built with modern teams in mind, KIET combines speed, aesthetics, and functionality.
                    </p>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
