import React from 'react';

function normalize(value = '') {
  return value.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function clueKind(type = '') {
  const key = normalize(type);
  if (key.includes('metadata')) return 'metadata';
  if (key.includes('social')) return 'social';
  if (key.includes('reverse')) return 'search';
  if (key.includes('architecture')) return 'blueprint';
  if (key.includes('geology')) return 'terrain';
  if (key.includes('satellite')) return 'satellite';
  if (key.includes('meteorology')) return 'weather';
  if (key.includes('account')) return 'account';
  if (key.includes('news') || key.includes('press') || key.includes('archive')) return 'news';
  return 'document';
}

function GeneratedImage({ data = {}, compact = false }) {
  if (!data.image) return null;

  return (
    <span className={`evidence-generated-image${compact ? ' compact' : ''}`}>
      <img src={data.image} alt="" loading="lazy" />
    </span>
  );
}

function WebsiteArt({ data = {}, compact = false }) {
  const styleType = normalize(data.styleType || data.reliability || data.type || 'website');
  return (
    <span className={`evidence-art evidence-website site-art-${styleType}${compact ? ' compact' : ''}`} aria-hidden="true">
      <span className="website-browser-bar">
        <i />
        <i />
        <i />
      </span>
      <span className="website-hero-line" />
      <span className="website-layout">
        <span className="website-main-block" />
        <span className="website-side-stack">
          <b />
          <b />
          <b />
        </span>
      </span>
      <span className="website-stamp">{styleType === 'official' ? 'gov' : styleType === 'academic' ? 'db' : styleType === 'tabloid' ? '!' : '$'}</span>
    </span>
  );
}

function WitnessArt({ data = {}, compact = false }) {
  const name = data.name || 'Witness';
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span
      className={`evidence-art evidence-witness${compact ? ' compact' : ''}`}
      style={{ '--witness-color': data.avatarBg || '#8d7be7' }}
      aria-hidden="true"
    >
      <span className="witness-card-hole" />
      <span className="witness-head">
        <span>{initials}</span>
      </span>
      <span className="witness-body" />
      <span className="witness-lines">
        <i />
        <i />
      </span>
    </span>
  );
}

function ClueArt({ data = {}, compact = false }) {
  const kind = clueKind(data.type);
  return (
    <span className={`evidence-art evidence-clue clue-art-${kind}${compact ? ' compact' : ''}`} aria-hidden="true">
      <span className="clue-paper">
        <span className="clue-topline" />
        <span className="clue-lines">
          <i />
          <i />
          <i />
        </span>
      </span>
      <span className="clue-symbol">
        {kind === 'metadata' && (
          <>
            <i className="clock-face" />
            <i className="data-chip" />
          </>
        )}
        {kind === 'social' && (
          <>
            <i className="post-bubble" />
            <i className="share-dot one" />
            <i className="share-dot two" />
            <i className="share-dot three" />
          </>
        )}
        {kind === 'search' && (
          <>
            <i className="search-lens" />
            <i className="image-tile one" />
            <i className="image-tile two" />
          </>
        )}
        {kind === 'blueprint' && (
          <>
            <i className="blueprint-grid" />
            <i className="building-line" />
          </>
        )}
        {kind === 'terrain' && (
          <>
            <i className="mountain one" />
            <i className="mountain two" />
          </>
        )}
        {kind === 'satellite' && (
          <>
            <i className="orbit" />
            <i className="sat-body" />
          </>
        )}
        {kind === 'weather' && (
          <>
            <i className="weather-sun" />
            <i className="weather-chart" />
          </>
        )}
        {kind === 'account' && (
          <>
            <i className="profile-head" />
            <i className="profile-body" />
            <i className="warning-mark" />
          </>
        )}
        {kind === 'news' && (
          <>
            <i className="news-photo" />
            <i className="news-column one" />
            <i className="news-column two" />
          </>
        )}
        {kind === 'document' && <i className="doc-fold" />}
      </span>
    </span>
  );
}

function ReportArt({ data = {}, compact = false }) {
  return (
    <span className={`evidence-art evidence-report${compact ? ' compact' : ''}`} aria-hidden="true">
      <span className="report-folder-tab" />
      <span className="report-photo-stack">
        <i />
        <i />
      </span>
      <span className="report-ribbon" />
      <span className="report-pinboard">
        <b />
        <b />
        <b />
      </span>
    </span>
  );
}

export default function EvidenceVisual({ kind = 'clue', data, label, compact = false, className = '' }) {
  const resolvedLabel = label || data?.title || data?.name || data?.siteName || 'Evidence';
  const generatedImage = <GeneratedImage data={data} compact={compact} />;

  return (
    <span className={`evidence-visual ${className}`} aria-label={resolvedLabel} role="img">
      {generatedImage || (
        <>
          {kind === 'witness' && <WitnessArt data={data} compact={compact} />}
          {kind === 'website' && <WebsiteArt data={data} compact={compact} />}
          {kind === 'report' && <ReportArt data={data} compact={compact} />}
          {kind !== 'witness' && kind !== 'website' && kind !== 'report' && <ClueArt data={data} compact={compact} />}
        </>
      )}
    </span>
  );
}
