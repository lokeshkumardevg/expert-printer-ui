import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero_hp from '../components/Hero_hp'
import ServicesSection from '../components/Services'
function ServicePage() {
  return (
   <>
   <Header/>
   <Hero_hp themeImage="/printer_ser.png" title="Guard Your Digital Life." subtitle="Authorized Antivirus Installation , Identity Protection , Malware Prevention "/>
   <ServicesSection/>
   <Footer/>
   </>
  )
}

export default ServicePage