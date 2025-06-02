"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter(); // Moved inside component body
  
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false
  });

  // Check password strength whenever password changes
  useEffect(() => {
    const password = data.password;
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValid = hasMinLength && hasNumber && hasSpecial;
    
    setPasswordStrength({
      hasMinLength,
      hasNumber,
      hasSpecial,
      isValid
    });
  }, [data.password]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!passwordStrength.isValid) {
    setError("Please ensure your password meets all requirements.");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess(false);

  try {
    const payload = {
      full_name: data.fullName,
      email: data.email,
      password: data.password,
    };

    console.log("Sending signup payload:", payload);

    const response = await fetch("http://localhost:8000/auth/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("Signup raw response:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      if (!response.ok) throw new Error(`Server returned: ${responseText}`);
    }

    if (!response.ok) {
      if (result && typeof result === "object") {
        if (result.email) setError(`Email error: ${result.email.join(", ")}`);
        else if (result.full_name) setError(`Name error: ${result.full_name.join(", ")}`);
        else if (result.password) setError(`Password error: ${result.password.join(", ")}`);
        else if (result.detail) setError(result.detail);
        else if (result.error) setError(result.error);
        else setError("Signup failed. Please check your information.");
      } else {
        setError("Signup failed. Please check your information.");
      }
      return;
    }

    console.log("Signup success. Attempting auto-login...");

    // Attempt login with same credentials
    const loginRes = await fetch("http://localhost:8000/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      throw new Error(loginData?.detail || "Auto-login failed.");
    }

    // Save tokens
    localStorage.setItem("access_token", loginData.access);
    localStorage.setItem("refresh_token", loginData.refresh || "");

    // Save user info
    if (loginData.user) {
      localStorage.setItem("user_data", JSON.stringify(loginData.user));
      sessionStorage.setItem("role_name", loginData.user.role);

      const userDataEvent = new CustomEvent("userLogin", {
        detail: loginData.user,
      });
      window.dispatchEvent(userDataEvent);
    }

    // Clear form and redirect
    setSuccess(true);
    setData({ fullName: "", email: "", password: "" });
    router.push("/");
  } catch (error) {
    console.error("Signup/Login error:", error);
    setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};

  
  return (
    <>
      {/* <!-- ===== SignUp Form Start ===== --> */}
      <section className="pb-12.5 pt-32.5 lg:pb-25 lg:pt-45 xl:pb-30 xl:pt-50">
        <div className="relative z-1 mx-auto max-w-c-1016 px-7.5 pb-7.5 pt-10 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute left-0 top-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="absolute bottom-17.5 left-0 -z-1 h-1/3 w-full">
            <Image
              src="/images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
              fill
            />
            <Image
              src="/images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              className="hidden dark:block"
              fill
            />
          </div>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: -20,
              },

              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1, delay: 0.1 }}
            viewport={{ once: true }}
            className="animate_top rounded-lg bg-white px-7.5 pt-7.5 shadow-solid-8 dark:border dark:border-strokedark dark:bg-black xl:px-15 xl:pt-15"
          >
            <h2 className="mb-15 text-center text-3xl font-semibold text-black dark:text-white xl:text-sectiontitle2">
              Create an Account
            </h2>

            <div className="mb-10 flex items-center justify-center">
              <span className="dark:bg-stroke-dark hidden h-[1px] w-full max-w-[200px] bg-stroke dark:bg-strokedark sm:block"></span>
              <p className="text-body-color dark:text-body-color-dark w-full px-5 text-center text-base">
                register with your email
              </p>
              <span className="dark:bg-stroke-dark hidden h-[1px] w-full max-w-[200px] bg-stroke dark:bg-strokedark sm:block"></span>
            </div>

            {error && (
              <div className="mb-5 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-5 rounded-md bg-green-50 p-4 text-sm text-green-500 dark:bg-green-900/30 dark:text-green-300">
                Account created successfully! You can now sign in.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5">
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full name"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  required
                  className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white"
                />
              </div>

              <div className="mb-7.5 flex flex-col gap-7.5 lg:mb-12.5 lg:flex-row lg:justify-between lg:gap-14">
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required
                  className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white lg:w-1/2"
                />

                <div className="w-full lg:w-1/2">
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    required
                    className="w-full border-b border-stroke bg-transparent pb-3.5 focus:border-waterloo focus:placeholder:text-black focus-visible:outline-hidden dark:border-strokedark dark:focus:border-manatee dark:focus:placeholder:text-white"
                  />
                  
                  {/* Password strength indicator */}
                  {data.password.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs">
                      <p className="font-medium">Password must have:</p>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className={passwordStrength.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className={passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                          At least one number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${passwordStrength.hasSpecial ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className={passwordStrength.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                          At least one special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-10 md:justify-between xl:gap-15">
                <div className="mb-4 flex items-center">
                  <input id="default-checkbox" type="checkbox" className="peer sr-only" />
                  <span className="border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 group mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-sm peer-checked:bg-primary">
                    <svg
                      className="opacity-0 in-[.group]:peer-checked:opacity-100"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.70704 0.792787C9.89451 0.980314 9.99983 1.23462 9.99983 1.49979C9.99983 1.76495 9.89451 2.01926 9.70704 2.20679L4.70704 7.20679C4.51951 7.39426 4.26521 7.49957 4.00004 7.49957C3.73488 7.49957 3.48057 7.39426 3.29304 7.20679L0.293041 4.20679C0.110883 4.01818 0.0100885 3.76558 0.0123669 3.50339C0.0146453 3.24119 0.119814 2.99038 0.305222 2.80497C0.490631 2.61956 0.741443 2.51439 1.00364 2.51211C1.26584 2.50983 1.51844 2.61063 1.70704 2.79279L4.00004 5.08579L8.29304 0.792787C8.48057 0.605316 8.73488 0.5 9.00004 0.5C9.26521 0.5 9.51951 0.605316 9.70704 0.792787Z"
                        fill="white"
                      />
                    </svg>
                  </span>
                 
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordStrength.isValid}
                  aria-label="signup with email and password"
                  className={`inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho ${
                    (loading || !passwordStrength.isValid) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && (
                    <svg
                      className="fill-white"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                        fill=""
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-12.5 border-t border-stroke py-5 text-center dark:border-strokedark">
                <p>
                  Already have an account?{" "}
                  <Link
                    className="text-black hover:text-primary dark:text-white dark:hover:text-primary"
                    href="/auth/signin"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
      {/* <!-- ===== SignUp Form End ===== --> */}
    </>
  );
};

export default Signup;