import React from 'react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-stone-900 border border-amber-500/30 font-['Cairo','Plus_Jakarta_Sans',sans-serif]">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Audit Technique du Code fourni</h2>
              <p className="text-xs text-stone-500 font-mono">Analyse complète & explication détaillée du projet "El Jem Live Watchers"</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 text-2xl font-bold px-2 rounded-full hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-stone-800">
          <section className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h3 className="font-bold text-amber-900 text-base mb-1">📌 Qu'est-ce que ce code ?</h3>
            <p>
              Ce code constitue l'application <strong>« El Jem Live Watchers » (خريطة الانقطاعات بالجم)</strong>, 
              une plateforme participative citoyenne de cartographie en temps réel des coupures de services publics 
              (<strong>Eau / SONEDE</strong>, <strong>Électricité / STEG</strong> et <strong>Internet / FAI</strong>) pour la ville d'El Jem (Gouvernorat de Mahdia, Tunisie).
            </p>
          </section>

          <section>
            <h3 className="font-bold text-stone-900 text-base mb-2">🏗️ 1. Architecture Globale du Système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">⚡ Backend (Cloudflare Worker + D1 SQL)</span>
                <ul className="list-disc pl-4 text-xs space-y-1 text-stone-600">
                  <li>API Serverless déployée sur l'infrastructure Edge Cloudflare.</li>
                  <li>Base de données relationnelle SQLite (Cloudflare D1).</li>
                  <li>Endpoints <code className="bg-stone-200 px-1 py-0.5 rounded">GET</code> (lecture état filtré) et <code className="bg-stone-200 px-1 py-0.5 rounded">POST</code> (signalement / modération / suppression).</li>
                  <li>Système d'événements historisés avec requête dédupliquée sur le <code className="bg-stone-200 px-1 py-0.5 rounded">receivedAt</code> le plus récent.</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-800 block mb-1">🗺️ Frontend (Cartographie & UI)</span>
                <ul className="list-disc pl-4 text-xs space-y-1 text-stone-600">
                  <li><strong>Leaflet.js</strong> alimenté par l'imagerie satellite ArcGIS World Imagery + étiquettes géographiques.</li>
                  <li>Assistant de signalement pas-à-pas (Langue, Localisation, Type, Note).</li>
                  <li>Support Bilingue LTR / RTL (Français & Arabe).</li>
                  <li>Panneau d'administration modérateur avec révision et filtrage par date.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-stone-900 text-base mb-2">🎯 2. Fonctionnalités Clés Identifiées</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-700">
              <li><strong>Géolocalisation Hybride :</strong> Détection automatique par GPS HTML5 avec secours par géolocalisation IP (<code className="bg-stone-100 px-1">ipapi.co</code>) ou placement manuel de repère avec géocodage inverse Nominatim.</li>
              <li><strong>Identification des FAI :</strong> Pour les coupures Internet, sélection de l'opérateur concerné (Tunisie Telecom, Orange, Ooredoo, Bee / Topnet / GNet) avec logos officiels.</li>
              <li><strong>Espace Modération Administrateur :</strong> Accès secret par séquence de touches clavier (<code className="bg-stone-100 px-1">eljem</code>) ou 5 clics rapides sur le logo. Protection par mot de passe SHA-256.</li>
              <li><strong>Bandeau d'Information Dynamique :</strong> Défilement continu affichant le nombre de visiteurs simulés, la répartition des pannes actives par catégorie et les liens réseaux sociaux d'<em>El Jem Info</em>.</li>
            </ul>
          </section>

          <section className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-900 text-base mb-2">🛡️ 3. Audit de Sécurité & Recommandations</h3>
            <div className="space-y-2 text-xs text-red-800">
              <div>
                <strong>⚠️ Authentification Administrateur Côté Client :</strong><br />
                Le hachage du mot de passe admin (<code className="bg-red-100 px-1 font-mono">9bf491...</code>) est stocké directement dans le code JavaScript du navigateur. Un utilisateur technique peut analyser le code et contourner la validation.
                <br /><em className="text-stone-600">Recommandation : Déplacer la validation du mot de passe dans le Cloudflare Worker avec un jeton JWT ou Cookie HTTP-Only.</em>
              </div>

              <div>
                <strong>⚠️ Origine CORS Permissive (<code className="bg-red-100 px-1">*</code>) :</strong><br />
                Le Worker autorise toutes les origines (<code className="bg-red-100 px-1">Access-Control-Allow-Origin: *</code>).
                <br /><em className="text-stone-600">Recommandation : Restreindre le CORS au domaine officiel de publication de l'application.</em>
              </div>

              <div>
                <strong>✅ Bon point - Protection contre les injections SQL & XSS :</strong><br />
                Les requêtes SQL utilisent les bindings paramétrés Cloudflare D1 (<code className="bg-stone-100 px-1">.bind(...)</code>). Le code frontend échappe également les notes textuelles (<code className="bg-stone-100 px-1">escapeHtml</code>) pour éviter les attaques XSS.
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-3 border-t border-stone-200 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            Fermer le Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
