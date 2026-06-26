import { Link } from 'react-router-dom';

const inter = "Inter, sans-serif";

function Footer() {
  return (
    <footer style={{ backgroundColor: '#1F2A44' }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <p className="text-xl font-bold tracking-tight" style={{ fontFamily: inter }}>
            <span className="text-white">hausse</span>
            <span style={{ color: '#E8A33D' }}>up</span>
          </p>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.50)', fontFamily: inter }}
          >
            Red de empleo para latinos en España. Con dignidad.
          </p>
        </div>

        {/* Producto */}
        <div>
          <h3
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: inter }}
          >
            Producto
          </h3>
          <ul className="space-y-2 text-sm" style={{ fontFamily: inter }}>
            <li>
              <Link
                to="/registro?tipo=candidato"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Para candidatos
              </Link>
            </li>
            <li>
              <Link
                to="/registro?tipo=empleador"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Para empleadores
              </Link>
            </li>
            <li>
              <a
                href="#how"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Cómo funciona
              </a>
            </li>
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <h3
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: inter }}
          >
            Empresa
          </h3>
          <ul className="space-y-2 text-sm" style={{ fontFamily: inter }}>
            <li>
              <Link
                to="/about"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Sobre nosotros
              </Link>
            </li>
            <li>
              <a
                href="mailto:gustavo@hausseup.com"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* Comunidad */}
        <div>
          <h3
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: inter }}
          >
            Comunidad
          </h3>
          <ul className="space-y-2 text-sm" style={{ fontFamily: inter }}>
            <li>
              <a
                href="https://youtube.com/@gustavo.perignan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/company/hausseup"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E8A33D] transition-colors"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <div
        className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
        style={{ color: 'rgba(255,255,255,0.35)', fontFamily: inter }}
      >
        <p>© 2026 Hausseup. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <Link to="/privacidad" className="hover:text-white transition-colors">
            Política de privacidad
          </Link>
          <Link to="/terminos" className="hover:text-white transition-colors">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
