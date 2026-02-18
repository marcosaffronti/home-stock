export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContentSection {
  title: string;
  body: string;
}

export interface ContentData {
  termsAndConditions: ContentSection;
  faq: {
    title: string;
    items: FaqItem[];
  };
  shippingPolicy: ContentSection;
}

export const defaultContent: ContentData = {
  termsAndConditions: {
    title: "Terminos y Condiciones",
    body: `
      <h2>Politica de Cambios</h2>
      <p>
        En Home Stock queremos que estes conforme con tu compra. Por eso, aceptamos
        <strong>cambios dentro de los 15 dias corridos</strong> desde la recepcion del producto,
        siempre y cuando el mismo se encuentre en <strong>perfectas condiciones</strong>, sin uso,
        en su embalaje original y con todos sus accesorios.
      </p>
      <p>
        Para gestionar un cambio, escribinos a
        <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a>
        indicando tu numero de pedido y el motivo del cambio. Nuestro equipo te contactara
        para coordinar el proceso.
      </p>
      <p>
        El cambio puede realizarse mediante envio a domicilio (el costo del flete corre por cuenta
        del comprador) o de forma presencial en nuestro showroom ubicado en
        <strong>Av. Pres. J.D. Peron 757, Villa de Mayo, Buenos Aires</strong>.
      </p>

      <h2>Devoluciones</h2>
      <p>
        <strong>No se aceptan devoluciones de dinero.</strong> Solo realizamos cambios de producto
        bajo las condiciones mencionadas anteriormente.
      </p>

      <h2>Boton de Arrepentimiento</h2>
      <p>
        De acuerdo con la normativa vigente de Defensa del Consumidor (Ley 24.240), tenes derecho
        a arrepentirte de tu compra dentro de los <strong>10 (diez) dias corridos</strong> contados
        desde la recepcion del producto, sin necesidad de justificar el motivo.
      </p>
      <p>
        Para ejercer este derecho, comunicate con nosotros a
        <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a>
        dentro del plazo indicado. El producto debera ser devuelto en las mismas condiciones
        en que fue recibido.
      </p>
      <p>
        Para mas informacion sobre tus derechos como consumidor, podes ingresar al sitio oficial
        de Defensa del Consumidor:
        <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener noreferrer">
          www.argentina.gob.ar/produccion/defensadelconsumidor/formulario
        </a>
      </p>

      <h2>Condiciones Generales</h2>
      <ul>
        <li>Los precios publicados estan expresados en pesos argentinos e incluyen IVA.</li>
        <li>Las imagenes son a modo ilustrativo. Los colores pueden variar levemente segun la pantalla del dispositivo.</li>
        <li>Home Stock se reserva el derecho de modificar precios y condiciones sin previo aviso.</li>
        <li>Al realizar una compra, el cliente acepta la totalidad de estos terminos y condiciones.</li>
      </ul>

      <h2>Contacto</h2>
      <p>
        Ante cualquier consulta, no dudes en escribirnos a
        <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a>
        o por WhatsApp al <strong>11 7164-3900</strong>.
      </p>
    `,
  },

  faq: {
    title: "Preguntas Frecuentes",
    items: [
      {
        question: "Como puedo comunicarme si tengo dudas?",
        answer: `
          <p>
            Podes comunicarte con nosotros por los siguientes canales:
          </p>
          <ul>
            <li><strong>WhatsApp:</strong> 11 7164-3900 (de lunes a viernes de 9 a 18 h, sabados de 10 a 14 h)</li>
            <li><strong>Instagram:</strong> <a href="https://instagram.com/homestock" target="_blank" rel="noopener noreferrer">@homestock</a></li>
            <li><strong>Email:</strong> <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a></li>
            <li><strong>Showroom:</strong> Av. Pres. J.D. Peron 757, Villa de Mayo, Buenos Aires. Visitanos con turno previo.</li>
          </ul>
        `,
      },
      {
        question: "Como puedo pagar?",
        answer: `
          <p>Ofrecemos varias formas de pago para tu comodidad:</p>
          <ul>
            <li>
              <strong>Mercado Pago:</strong> Aceptamos tarjetas de credito y debito.
              <ul>
                <li>Compras menores a $400.000: hasta <strong>3 cuotas sin interes</strong>.</li>
                <li>Compras mayores a $400.000: hasta <strong>6 cuotas sin interes</strong>.</li>
              </ul>
            </li>
            <li><strong>Transferencia bancaria:</strong> Obtene un <strong>25% OFF</strong> abonando por transferencia.</li>
            <li><strong>Efectivo:</strong> Pago en efectivo disponible en nuestro showroom.</li>
          </ul>
        `,
      },
      {
        question: "Cual es la forma de envio?",
        answer: `
          <p>Los pedidos se despachan entre <strong>15 y 60 dias habiles</strong> dependiendo del producto y disponibilidad de stock. Los muebles a medida o personalizados pueden requerir plazos mas extensos.</p>
          <ul>
            <li><strong>Interior del pais:</strong> Realizamos envios a todo el pais a traves de transporte. Los costos varian segun las dimensiones, peso del producto y la localidad de destino.</li>
            <li><strong>CABA y GBA:</strong> Envio por flete privado. Consulta el costo por WhatsApp al 11 7164-3900.</li>
            <li><strong>Retiro en showroom:</strong> Podes retirar tu compra sin costo en Av. Pres. J.D. Peron 757, Villa de Mayo.</li>
          </ul>
        `,
      },
      {
        question: "Puedo retirar personalmente mi compra?",
        answer: `
          <p>
            Si, por supuesto. Una vez que Home Stock te indique que tu pedido esta disponible
            (entre 15 y 60 dias habiles segun el producto), podes retirarlo personalmente
            en nuestro showroom:
          </p>
          <p>
            <strong>Av. Pres. J.D. Peron 757, Villa de Mayo, Buenos Aires.</strong>
          </p>
          <p>
            Te recomendamos coordinar previamente el dia y horario de retiro por WhatsApp
            al <strong>11 7164-3900</strong> para asegurarnos de tener todo listo.
          </p>
        `,
      },
      {
        question: "Como es la politica de cambios?",
        answer: `
          <p>
            Aceptamos <strong>cambios dentro de los 15 dias corridos</strong> desde la recepcion
            del producto, siempre que se encuentre en perfectas condiciones, sin uso y en su
            embalaje original.
          </p>
          <p>
            Para solicitar un cambio, escribinos a
            <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a>
            con tu numero de pedido.
          </p>
          <p>
            <strong>Importante:</strong> No se aceptan devoluciones de dinero.
            Solo cambios de producto.
          </p>
        `,
      },
      {
        question: "Hacen trabajos a medida?",
        answer: `
          <p>
            Si, realizamos <strong>muebles a medida y personalizados</strong>. Podemos adaptar
            dimensiones, telas, colores y acabados segun tus necesidades.
          </p>
          <p>
            Consulta por WhatsApp al <strong>11 7164-3900</strong> contandonos tu idea y te
            asesoramos sin compromiso. Tambien podes visitarnos en nuestro showroom para ver
            muestras de telas y materiales.
          </p>
        `,
      },
    ],
  },

  shippingPolicy: {
    title: "Politica de Envios",
    body: `
      <h2>Plazos de Entrega</h2>
      <p>
        Los pedidos se despachan entre <strong>15 y 60 dias habiles</strong> dependiendo del
        producto, la disponibilidad de stock y si se trata de un mueble estandar o a medida.
        Los productos personalizados o fabricados a medida pueden requerir plazos mas extensos.
      </p>
      <p>
        Una vez despachado tu pedido, te notificaremos por WhatsApp o email con los datos
        de seguimiento correspondientes.
      </p>

      <h2>Envios al Interior del Pais</h2>
      <p>
        Realizamos envios a <strong>todo el pais</strong> a traves de empresas de transporte.
        Los costos de envio varian segun las dimensiones, peso del producto y la localidad de destino.
      </p>
      <p>
        Antes de confirmar tu compra, podes consultarnos el costo estimado de envio por
        WhatsApp al <strong>11 7164-3900</strong>.
      </p>

      <h2>Envios a CABA y GBA</h2>
      <p>
        Para la zona de <strong>Capital Federal y Gran Buenos Aires</strong>, contamos con servicio
        de flete privado. El costo del envio depende de la zona y las dimensiones del producto.
      </p>
      <p>
        Consulta el valor exacto por WhatsApp al <strong>11 7164-3900</strong> antes de realizar
        tu pedido.
      </p>

      <h2>Retiro en Showroom</h2>
      <p>
        Podes retirar tu compra <strong>sin costo</strong> en nuestro showroom ubicado en:
      </p>
      <p>
        <strong>Av. Pres. J.D. Peron 757, Villa de Mayo, Buenos Aires.</strong>
      </p>
      <p>
        Coordina el dia y horario de retiro por WhatsApp para que tengamos tu pedido preparado.
      </p>

      <h2>Embalaje y Proteccion</h2>
      <p>
        Todos nuestros productos son despachados con <strong>embalaje protector</strong> para
        garantizar que lleguen en perfectas condiciones. Utilizamos materiales de proteccion
        adecuados segun el tipo de mueble.
      </p>

      <h2>Instalacion</h2>
      <p>
        El servicio de instalacion o armado <strong>no esta incluido</strong> en el precio del
        producto ni en el costo del envio, salvo que se acuerde previamente de forma explicita.
      </p>
      <p>
        Si necesitas servicio de instalacion, consulta con nuestro equipo para coordinar
        un presupuesto adicional.
      </p>

      <h2>Consultas</h2>
      <p>
        Ante cualquier duda sobre envios, plazos o costos, comunicate con nosotros:
      </p>
      <ul>
        <li><strong>WhatsApp:</strong> 11 7164-3900</li>
        <li><strong>Email:</strong> <a href="mailto:somoshomestock@gmail.com">somoshomestock@gmail.com</a></li>
      </ul>
    `,
  },
};
