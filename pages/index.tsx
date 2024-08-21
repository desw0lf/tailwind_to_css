import { ClipboardCopyIcon } from '@heroicons/react/outline';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import GitHubButton from 'react-github-button';
import { toast } from 'sonner';
import { convertFromCssToJss, getConvertedClasses } from '../libs/helpers';
import CodeKeep from '../public/CodeKeep.svg';
import Logo from '../public/logo.svg';

const TAILWIND_DOCS_URL_PARTIAL = "tailwindcss.com/docs";
const IM_FEELING_LUCKY_URL = `https://google.com/search?btnI=1&q=site:${TAILWIND_DOCS_URL_PARTIAL}%20`;

export default function App() {
	const [input, setInput] = useState('');

	const [result, setResult] = useState('');

	const [resultJSS, setResultJSS] = useState('');

	const [resultNotFound, setResultNotFound] = useState([]);

	useEffect(() => {
		const { resultCss, notFound } = getConvertedClasses(input);
		const resultJSS = convertFromCssToJss(resultCss);
		setResult(resultCss);
		setResultJSS(resultJSS);
		setResultNotFound(notFound);
	}, [input]);

	return (
		<main>
			<nav className="w-full">
				<Head>
					<title>Tailwind To CSS</title>
					<meta name="description" content="Tailwind To CSS" />
					<link rel="icon" href="/logo.svg" />
				</Head>

				<header className="bg-[#000] flex py-2 px-1 md:p-2 border-b border-gray-800">
					<h1 className="flex-grow font-bold flex items-center text-gray-300 md:mr-2">
						<div className="mx-2">
							<Image src={Logo} alt="Tailwind-to-CSS logo" height={24} width={24} />
						</div>
						<span className="hidden md:flex">Tailwind To CSS</span>
					</h1>

					<section className="space-x-1 md:space-x-2 flex items-center ">
						<GitHubButton
							type="stargazers"
							namespace="Devzstudio"
							repo="tailwind_to_css"
							className="sm:mr-2"
						/>
						<button className="bg-[#111] hover:bg-gray-700 rounded py-2 px-2">
							<a
								target="_BLANK"
								href="https://codekeep.io?ref=tailwind-to-css"
								rel="noreferrer noopener"
								className="flex items-center text-gray-400"
							>
								<span className="pr-1 text-sm hidden md:flex">Sponsored by</span>
								<Image alt="CodeKeep" height={24} width={24} src={CodeKeep} />
								<span className="pl-1 text-sm">CodeKeep</span>
							</a>
						</button>
					</section>
				</header>
			</nav>

			<section className="flex flex-col-reverse md:flex-row bg-gray-900 flex-grow">
				<div className="flex w-full flex-col">
					<textarea
						className="w-full resize-none flex-grow p-3 bg-[#111] text-gray-300 outline-none border-none"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Enter your tailwind class names here... Eg: bg-red-500 text-center"
						autoFocus
					></textarea>
					<div
						className="w-full resize-none p-3 bg-[#2d0000] text-gray-300 outline-none border-none flex flex-wrap"
						style={{gap: "4px"}}
					>
						{resultNotFound.length === 0 && <span>Not found classes</span>}
						{resultNotFound.map((cl) => {
							return <a className="hover:underline" key={cl} href={IM_FEELING_LUCKY_URL + cl} target="_blank" rel="nofollow">{cl}</a>
						})}
					</div>
				</div>
				{/* CSS */}
				<div className="flex w-full bg-[#111] border-l border-gray-700">
					<textarea
						className="w-full resize-none flex-grow p-3 bg-[#111] text-gray-300 outline-none"
						placeholder="CSS"
						value={result}
						readOnly
					></textarea>
					<CopyToClipboard text={result} onCopy={() => toast.success('Copied!')}>
						<ClipboardCopyIcon className="w-6 h-6 mt-3 text-gray-500 cursor-pointer md:mr-1" />
					</CopyToClipboard>
				</div>

				{/* JSS */}
				<div className="flex w-full bg-[#111] border-l border-gray-700">
					<textarea
						className="w-full resize-none flex-grow p-3 bg-[#111] text-gray-300 outline-none"
						placeholder="JSS (beta)"
						value={resultJSS}
						readOnly
					></textarea>
					<CopyToClipboard text={resultJSS} onCopy={() => toast.success('Copied!')}>
						<ClipboardCopyIcon className="w-6 h-6 mt-3 text-gray-500 cursor-pointer md:mr-1" />
					</CopyToClipboard>
				</div>
			</section>
		</main>
	);
}
