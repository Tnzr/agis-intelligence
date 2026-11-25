import { ArrowUpRight, Mail, Sprout } from 'lucide-react'

export const contact = 'mailto:b.garcia@pioneerinnovations.org'

export function Pilot() {
  return <section className="card pilot-card" id="pilot" aria-labelledby="pilot-title">
    <div><div className="eyebrow"><Sprout size={16} /> Pilot partnership</div>
      <h2 id="pilot-title">What a pilot looks like</h2>
      <p>Start with 5–20 greenhouses for one growing season. Equip them with open-source ESP32 controllers and compare measured water flow and weighed harvests against a baseline. Agree on what data to share and publish a joint impact report.</p>
    </div>
    <div className="pilot-actions"><a className="primary-button" href={contact}><Mail size={16} /> Discuss a pilot</a><a className="quiet-button" href="https://pioneerinnovations.org" target="_blank" rel="noopener noreferrer">Pioneer Innovations Collective <ArrowUpRight size={15} /></a></div>
  </section>
}
