import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";

function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <>
      <Header />
      <HeroSection />
      <Features />
      {!usuario && (
        <>
          <Login onLogin={setUsuario} />
          <Register onRegister={() => {}} />
        </>
      )}
      {usuario && (
        <div>
          <h2>Bem-vindo, {usuario.nome || usuario.email}!</h2>
          {/* Aqui pode colocar painel do usuário, etc */}
        </div>
      )}
      <Footer />
    </>
  );
}

export default App;