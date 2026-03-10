import React, { useState } from "react";

const BlogSteps = ({ steps }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await fetch("https://your-api-url.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

      setShowPopup(true);
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 px-4 sm:px-6 lg:px-18">
        
        {/* Left Side - Dynamic Steps */}
        <div className="flex-1 flex flex-col gap-[40px]">
          {steps?.map((item, index) => (
            <div key={index} className="flex flex-col gap-4">
              
              {/* Step Text */}
              <p
                className=" font-['Inter']
                text-[18px] sm:text-[20px] lg:text-[22px]
                leading-[26px] sm:leading-[30px] lg:leading-[32px]
                tracking-[0em]
                text-gray-800
                align-middle"
              >
                <span className="font-semibold">{item.step}:</span> {item.text}
              </p>

              {/* Step Image */}
              <div className="w-full overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.step}
                  className="w-full h-auto object-cover transform transition-transform duration-500 ease-in-out hover:scale-110"
                />
              </div>

            </div>
          ))}
        </div>

        {/* Right Side - FORM (UNCHANGED EXACTLY AS YOU SAID) */}
        <div className="w-full lg:w-[380px] self-start">
          <div
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md 
                transform transition-all duration-300 ease-in-out 
                hover:-translate-y-2 hover:shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-2">
              Having trouble with your printer?
            </h3>

            <p className="text-gray-600 text-sm mb-5">
              Please provide details about the issue you are experiencing with
              your printer. Our technical support team will review your
              complaint and contact you promptly to assist.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your number"
                  maxLength={10}
                  className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Looking For */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Looking For?
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message"
                  className={`border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`text-white py-3 rounded-md font-medium transition cursor-pointer ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5695D0]"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-2">
              Form Submitted Successfully 🎉
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team will contact you shortly.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-[#5695D0] text-white px-5 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogSteps;



// import React, { useState } from "react";

// const stepsData = [
//   {
//     step: "Step 1",
//     text: "To fix printer connection problems, first turn the printer off. Simply press the power button once.",
//     image: "/blogstep1.png",
//   },
//   {
//     step: "Step 2",
//     text: "After turning off the printer, pull out the power cable from the back of the printer.",
//     image: "/blogstep2.png",
//   },
//   {
//     step: "Step 3",
//     text: "Printer network troubleshooting will only be successful if you reset the router. Take the power plug out from the wireless router.",
//     image: "/blogstep3.png",
//   },
//   {
//     step: "Step 4",
//     text: "After waiting for 5 to 10 minutes, put the power cable back into the router to fix the printer connectivity issue.",
//     image: "/blogstep4.png",
//   },
//   {
//     step: "Step 5",
//     text: "When the router is turned on, put the power supply cable back into the printer.",
//     image: "/blogstep5.png",
//   },
//   {
//     step: "Step 6",
//     text: "Finally, turn the printer back on and try reconnecting it to the wireless network.",
//     image: "/blogstep6.png",
//   },
// ];

// const BlogSteps = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     message: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const validateForm = () => {
//     let newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(formData.phone)) {
//       newErrors.phone = "Phone number must be 10 digits";
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       newErrors.email = "Enter valid email address";
//     }

//     if (!formData.message.trim()) {
//       newErrors.message = "Message is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     try {
//       setLoading(true);

//       // 🔥 Replace this later
//       await fetch("https://your-api-url.com/submit", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       setFormData({
//         name: "",
//         phone: "",
//         email: "",
//         message: "",
//       });

//       setShowPopup(true);
//     } catch (error) {
//       alert("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="w-full bg-white py-16">
//       <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 px-4 sm:px-6 lg:px-18">
//         {/* Left Side - Steps */}
//         <div className="flex-1 flex flex-col gap-[40px]">
//           {stepsData.map((item, index) => (
//             <div key={index} className="flex flex-col gap-4">
//               {/* Step Text */}
//               <p
//                 className=" font-['Inter']
//                 text-[18px] sm:text-[20px] lg:text-[22px]
//                 leading-[26px] sm:leading-[30px] lg:leading-[32px]
//                 tracking-[0em]
//                 text-gray-800
//                 align-middle"
//               >
//                 <span className="font-semibold">{item.step}:</span> {item.text}
//               </p>

//               {/* Step Image */}
//               <div className="w-full overflow-hidden rounded-xl">
//                 <img
//                   src={item.image}
//                   alt={item.step}
//                   className="w-full h-auto object-cover transform transition-transform duration-500 ease-in-out hover:scale-110"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Right Side - Form */}
//         <div className="w-full lg:w-[380px] self-start">
//           <div
//             className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md 
//                 transform transition-all duration-300 ease-in-out 
//                 hover:-translate-y-2 hover:shadow-2xl"
//           >
//             <h3 className="text-lg font-semibold mb-2">
//               Having trouble with your printer?
//             </h3>

//             <p className="text-gray-600 text-sm mb-5">
//               Please provide details about the issue you are experiencing with
//               your printer. Our technical support team will review your
//               complaint and contact you promptly to assist.
//             </p>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//               {/* Name */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter your name"
//                   className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
//                     errors.name ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-xs">{errors.name}</p>
//                 )}
//               </div>

//               {/* Phone Number */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="Enter your number"
//                   maxLength={10}
//                   className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
//                     errors.phone ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs">{errors.phone}</p>
//                 )}
//               </div>

//               {/* Email */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                   className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs">{errors.email}</p>
//                 )}
//               </div>

//               {/* Looking For */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-sm font-medium text-gray-700">
//                   Looking For?
//                 </label>
//                 <textarea
//                   rows={4}
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   placeholder="Type your message"
//                   className={`border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5695D0] ${
//                     errors.message ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.message && (
//                   <p className="text-red-500 text-xs">{errors.message}</p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`text-white py-3 rounded-md font-medium transition cursor-pointer ${
//                   loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5695D0]"
//                 }`}
//               >
//                 {loading ? "Submitting..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//       {showPopup && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-xl w-[90%] max-w-sm text-center shadow-xl">
//             <h3 className="text-lg font-semibold mb-2">
//               Form Submitted Successfully 🎉
//             </h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Our support team will contact you shortly.
//             </p>
//             <button
//               onClick={() => setShowPopup(false)}
//               className="bg-[#5695D0] text-white px-5 py-2 rounded-md"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default BlogSteps;
