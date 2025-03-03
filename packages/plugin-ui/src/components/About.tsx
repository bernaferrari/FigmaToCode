import React from "react";

const About = () => {
  return (
    <div className="flex flex-col p-5 gap-4 text-sm max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold mb-1">Figma to Code</h2>
        <p className="text-neutral-600 dark:text-neutral-300">
          Created by Bernardo Ferrari
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Privacy Policy</h3>
        <p className="text-neutral-600 dark:text-neutral-300">
          This plugin is completely private. It processes your design locally and
          does not collect or transmit any of your data.
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Open Source</h3>
        <p className="text-neutral-600 dark:text-neutral-300">
          Figma to Code is an open-source project. You can view the source code
          and contribute on GitHub.
        </p>
        <a 
          href="https://github.com/bernaferrari/figma-to-code"
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-600 dark:text-green-400 hover:underline mt-1 inline-block"
        >
          View on GitHub
        </a>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Contact</h3>
        <p className="text-neutral-600 dark:text-neutral-300">
          If you have any issues, feedback, or questions, please contact me:
        </p>
        <ul className="mt-1 space-y-1">
          <li>
            <a 
              href="mailto:be.ferrari@gmail.com" 
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              be.ferrari@gmail.com
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/bernaferrari"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              GitHub: @bernaferrari
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default About;
