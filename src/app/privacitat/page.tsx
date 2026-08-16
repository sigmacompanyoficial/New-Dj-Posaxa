import React from "react";

export default function Privacitat() {
  return (
    <main className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-black-deep text-white-pure">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-6xl font-bold tracking-widest md:tracking-widest-xl uppercase mb-8 border-b border-white-pure/10 pb-6">
          Privacitat
        </h1>
        
        <div className="space-y-12 text-sm md:text-base text-gray-400 leading-loose tracking-widest uppercase">
          <section>
            <h2 className="text-white-pure font-bold mb-4">1. Protecció de Dades</h2>
            <p>
              DJ POSAXA compleix amb les directrius del Reglament General de Protecció de Dades (RGPD) i la resta de normativa vigent en cada moment, i vetlla per garantir un correcte ús i tractament de les dades personals de l'usuari.
            </p>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">2. Dades Recollides</h2>
            <p>
              A través del formulari de contacte o reserva, es recullen dades com nom, email i telèfon amb l'única finalitat de gestionar les peticions d'informació o contractació de serveis musicals.
            </p>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">3. Drets</h2>
            <p>
              L'usuari podrà exercir els seus drets d'accés, rectificació, cancel·lació i oposició mitjançant un correu electrònic a ayoub.louah10@gmail.com, identificant-se degudament.
            </p>
          </section>

          <div className="pt-12 border-t border-white-pure/10">
            <p className="text-[10px] text-gray-600">
              ÚLTIMA ACTUALITZACIÓ: MAIG 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
