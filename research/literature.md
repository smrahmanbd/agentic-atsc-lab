# Level 3 Literature Brief: Recent Research, Gaps and Future Directions

*Course: Agentic AI for Adaptive Traffic Signal Control (ATSC). Compiled 30 October 2026.*

**How this was checked.** For every entry below, the title, authors, year and venue were checked against a live source: the arXiv abstract page, the publisher or proceedings page, or an institutional repository. The contribution sentences paraphrase the abstract or the publisher's summary. Quantitative results are given only when the abstract states them. When an arXiv page names no venue, the entry says "arXiv preprint", even if the paper may have been published since. Citation keys in square brackets, e.g. [lai2025llmlight], match the `id` field in `references.json`.

## 1. Landscape in brief

**LLM and agentic controllers (2023-2026).** The field has moved from "LLM as chatbot over traffic tools" to "LLM as the controller" and then to hybrids. In the first group, TrafficGPT [zhang2024trafficgpt] and Open-TI [da2024openti] let an LLM orchestrate traffic tools and simulators. In the second, LLMLight/LightGPT [lai2025llmlight] has an LLM pick phases directly, and CoLLMLight [yuan2026collmlight] extends this to cooperative, network-wide agents. The hybrids pair an LLM with RL or classical control. iLLM-TSC [pang2024illmtsc] uses the LLM to audit RL actions. LA-Light [wang2024lalight] gives the LLM a toolset that includes existing controllers. VLMLight [wang2025vlmlight] routes routine cases to RL and critical cases to LLM reasoning. HeraldLight [guo2025heraldlight] adds an LLM critic that checks for hallucinated or erroneous decisions. PromptGAT [da2024promptgat] uses an LLM to model real-world dynamics for sim-to-real transfer. Evaluation is simulation-only. When an abstract names the setup, it is CityFlow with the Jinan, Hangzhou and New York datasets [guo2025heraldlight]. The headline gains stated in the abstracts are 17.5-20.4% in waiting or travel time against RL baselines [wang2024lalight; pang2024illmtsc; guo2025heraldlight]. None of the nine LLM papers reports a field deployment.

**Deep RL and MARL baselines.** PressLight [wei2019presslight], CoLight [wei2019colight], MPLight [chen2020mplight], FRAP [zheng2019frap], AttendLight [oroojlooy2020attendlight], Advanced-XLight [zhang2022advancedxlight] and Efficient-XLight [wu2021efficientxlight] are the standard comparison set. They run on CityFlow [zhang2019cityflow], SUMO [lopez2018sumo], SUMO-RL [alegre2019sumorl], RESCO [ault2021resco], LibSignal [mei2023libsignal] and LemgoRL [muller2021lemgorl].

**Max-pressure.** Max-pressure [varaiya2013maxpressure] remains the strongest analytically grounded baseline, and several of the RL methods above build their state or reward on it. A 2023 review [levin2023mpreview] summarises its variants. Hardware-in-the-loop work [stern2024mndot] is moving it toward field use.

**Connected and automated vehicles.** CV/CAV signal control [guo2019cavsurvey; feng2015cvasc; zhang2024rlcavsurvey], eco-driving and GLOSA [jayawardana2022ecodriving; lebre2015glosa], and mixed-autonomy intersections [yan2021mixedautonomy] all show that benefits depend strongly on penetration rate.


## 2. References (40 entries, verified)


### 2.1 LLM and agentic traffic signal control

1. **[lai2025llmlight]** Siqi Lai, Zhao Xu, Weijia Zhang, Hao Liu, Hui Xiong (2025). *LLMLight: Large Language Models as Traffic Signal Control Agents*. Proc. ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2025); arXiv:2312.16044. <https://arxiv.org/abs/2312.16044>  
   *Contribution:* Uses an LLM as the signal-control agent, prompted with real-time traffic state and reasoning step by step, plus LightGPT, a backbone fine-tuned for TSC; on ten real and synthetic datasets it is reported to beat nine traditional/RL baselines and ten general LLMs, with interpretability rated by fifteen human experts.

2. **[wang2024lalight]** Maonan Wang, Aoyu Pang, Yuheng Kan, Man-On Pun, Chung Shue Chen, Bo Huang (2024). *LLM-Assisted Light: Leveraging Large Language Model Capabilities for Human-Mimetic Traffic Signal Control in Complex Urban Environments*. arXiv preprint arXiv:2403.08337. <https://arxiv.org/abs/2403.08337>  
   *Contribution:* LA-Light places an LLM at the centre of control and gives it perception and decision tools (static/dynamic traffic queries, existing TSC algorithms); in the authors' simulation platform it adapts without retraining and cuts average waiting time by 20.4% vs. RL controllers under sensor-outage conditions.

3. **[zhang2024trafficgpt]** Siyao Zhang, Daocheng Fu, Zhao Zhang, Bin Yu, Pinlong Cai (2024). *TrafficGPT: Viewing, Processing and Interacting with Traffic Foundation Models*. Transport Policy, 150, 95-105; arXiv:2309.06719. <https://doi.org/10.1016/j.tranpol.2024.03.006>  
   *Contribution:* Couples ChatGPT with traffic foundation models so the LLM can decompose traffic-management tasks, call tools in sequence and interact with users in natural language; the abstract reports capabilities, not quantitative control results.

4. **[da2024promptgat]** Longchao Da, Minquan Gao, Hao Mei, Hua Wei (2024). *Prompt to Transfer: Sim-to-Real Transfer for Traffic Signal Control with Prompt Learning*. Proc. AAAI Conference on Artificial Intelligence (AAAI 2024); arXiv:2308.14284. <https://ojs.aaai.org/index.php/AAAI/article/view/27758>  
   *Contribution:* PromptGAT uses LLM cloze-style prompts to infer how weather, road type and traffic state alter system dynamics, then grounds a DQN agent's actions to those dynamics, narrowing the sim-to-real performance gap.

5. **[da2024openti]** Longchao Da, Kuanru Liou, Tiejin Chen, Xuesong Zhou, Xiangyong Luo, Yezhou Yang, Hua Wei (2024). *Open-TI: Open Traffic Intelligence with Augmented Language Model*. Springer journal article, DOI 10.1007/s13042-024-02190-8; arXiv:2401.00211. <https://arxiv.org/abs/2401.00211>  
   *Contribution:* Tool-augmented LLM that runs traffic analysis end to end (map acquisition, simulation, TSC policy training) through conversation, and demonstrates an agent-to-agent setup where Open-TI passes intent to a control agent (ChatZero) that selects signal actions.

6. **[pang2024illmtsc]** Aoyu Pang, Maonan Wang, Man-On Pun, Chung Shue Chen, Xi Xiong (2024). *iLLM-TSC: Integration reinforcement learning and large language model for traffic signal control policy improvement*. arXiv preprint arXiv:2407.06025. <https://arxiv.org/abs/2407.06025>  
   *Contribution:* LLM-assisted RL: an RL agent proposes the phase and an LLM checks and corrects unreasonable decisions (degraded communication, rare events such as emergency vehicles), reducing average waiting time by 17.5% vs. RL alone under degraded communication.

7. **[yuan2026collmlight]** Zirui Yuan, Siqi Lai, Hao Liu (2026). *CoLLMLight: Cooperative Large Language Model Agents for Network-Wide Traffic Signal Control*. International Conference on Learning Representations (ICLR 2026); arXiv:2503.11739. <https://arxiv.org/abs/2503.11739>  
   *Contribution:* Network-level cooperative LLM agents using a spatiotemporal graph of neighbouring intersections, complexity-aware reasoning depth and simulation-feedback fine-tuning of a lightweight LLM; reported to outperform state-of-the-art methods on synthetic and real datasets.

8. **[wang2025vlmlight]** Maonan Wang, Yirong Chen, Aoyu Pang, Yuxin Cai, Chung Shue Chen, Yuheng Kan, Man On Pun (2025). *VLMLight: Safety-Critical Traffic Signal Control via Vision-Language Meta-Control and Dual-Branch Reasoning Architecture*. Advances in Neural Information Processing Systems 38 (NeurIPS 2025), pp. 39590-39621. <https://papers.neurips.cc/paper_files/paper/2025/hash/3849b5861dcaeaf4758eef0979a98cc6-Abstract-Conference.html>  
   *Contribution:* An LLM meta-controller routes routine traffic to a fast RL policy and critical cases to multi-agent LLM reasoning over image-based multi-view intersection input; emergency-vehicle waiting time drops by up to 65% vs. RL-only with <1% degradation in normal conditions.

9. **[guo2025heraldlight]** Qing Guo, Xinhang Li, Junyu Chen, Zheng Guo, Xiaocong Li, Lin Zhang, Lei Li (2025). *A Dual Large Language Models Architecture with Herald Guided Prompts for Parallel Fine Grained Traffic Signal Control*. arXiv preprint arXiv:2511.00136. <https://arxiv.org/abs/2511.00136>  
   *Contribution:* HeraldLight pairs an LLM-Agent that sets fine-grained timings from forecast queues with an LLM-Critic that catches errors and hallucinations; in CityFlow on Jinan, Hangzhou and New York data (224 intersections) it reports a 20.03% reduction in average travel time.


### 2.2 Deep RL / multi-agent RL baselines

10. **[wei2019presslight]** Hua Wei, Chacha Chen, Guanjie Zheng, Kan Wu, Vikash Gayah, Kai Xu, Zhenhui Li (2019). *PressLight: Learning Max Pressure Control to Coordinate Traffic Signals in Arterial Network*. Proc. 25th ACM SIGKDD Int. Conf. on Knowledge Discovery & Data Mining (KDD 2019), pp. 1290-1298. <https://doi.org/10.1145/3292500.3330949>  
   *Contribution:* Grounds the RL reward in max-pressure theory (linked to throughput maximisation) with a compact state, outperforming conventional and prior learning-based controllers on arterials.

11. **[wei2019colight]** Hua Wei, Nan Xu, Huichu Zhang, Guanjie Zheng, Xinshi Zang, Chacha Chen, Weinan Zhang, Yanmin Zhu, Kai Xu, Zhenhui Li (2019). *CoLight: Learning Network-level Cooperation for Traffic Signal Control*. Proc. 28th ACM Int. Conf. on Information and Knowledge Management (CIKM 2019); arXiv:1905.05717. <https://doi.org/10.1145/3357384.3357902>  
   *Contribution:* Uses graph attention so neighbouring signal agents communicate and coordinate, reported to outperform state-of-the-art methods on a network with hundreds of signals.

12. **[chen2020mplight]** Chacha Chen, Hua Wei, Nan Xu, Guanjie Zheng, Ming Yang, Yuanhao Xiong, Kai Xu, Zhenhui Li (2020). *Toward A Thousand Lights: Decentralized Deep Reinforcement Learning for Large-Scale Traffic Signal Control*. Proc. AAAI Conference on Artificial Intelligence, 34(04), 3414-3421. <https://doi.org/10.1609/aaai.v34i04.5744>  
   *Contribution:* MPLight: decentralized deep RL using pressure-based regional coordination and a reward that lets agents coordinate implicitly, demonstrated on a real-world Manhattan network of 2,510 traffic lights.

13. **[zheng2019frap]** Guanjie Zheng, Yuanhao Xiong, Xinshi Zang, Jie Feng, Hua Wei, Huichu Zhang, Yong Li, Kai Xu, Zhenhui Li (2019). *Learning Phase Competition for Traffic Signal Control*. Proc. 28th ACM Int. Conf. on Information and Knowledge Management (CIKM 2019), pp. 1963-1972. <https://doi.org/10.1145/3357384.3357900>  
   *Contribution:* FRAP models competition between phases by demand, giving invariance to flips/rotations, faster convergence and better generalisation across intersection structures.

14. **[oroojlooy2020attendlight]** Afshin Oroojlooy, Mohammadreza Nazari, Davood Hajinezhad, Jorge Silva (2020). *AttendLight: Universal Attention-Based Reinforcement Learning Model for Traffic Signal Control*. Advances in Neural Information Processing Systems 33 (NeurIPS 2020). <https://papers.nips.cc/paper/2020/hash/29e48b79ae6fc68e9b6480b677453586-Abstract.html>  
   *Contribution:* A single attention-based policy that handles intersections with different numbers of roads, lanes and phases without retraining, outperforming classical and RL baselines in single- and multi-environment regimes.

15. **[zhang2022advancedxlight]** Liang Zhang, Qiang Wu, Jun Shen, Linyuan Lü, Bo Du, Jianqing Wu (2022). *Expression might be enough: representing pressure and demand for reinforcement learning based traffic signal control*. arXiv preprint arXiv:2112.10107 (v3, 2022). <https://arxiv.org/abs/2112.10107>  
   *Contribution:* Proposes Advanced-MP (counting running and queued vehicles) and the ATS state representation, yielding Advanced-MPLight and Advanced-CoLight that reach state-of-the-art results on real-world datasets.

16. **[wu2021efficientxlight]** Qiang Wu, Liang Zhang, Jun Shen, Linyuan Lü, Bo Du, Jianqing Wu (2021). *Efficient Pressure: Improving efficiency for signalized intersections*. arXiv preprint arXiv:2112.02336. <https://arxiv.org/abs/2112.02336>  
   *Contribution:* Introduces efficient pressure (EP) and builds Efficient-MP and the Efficient-XLight RL family, evaluated on multiple real-world datasets.


### 2.3 Simulators and benchmark platforms

17. **[zhang2019cityflow]** Huichu Zhang, Siyuan Feng, Chang Liu, Yaoyao Ding, Yichen Zhu, Zihan Zhou, Weinan Zhang, Yong Yu, Haiming Jin, Zhenhui Li (2019). *CityFlow: A Multi-Agent Reinforcement Learning Environment for Large Scale City Traffic Scenario*. The World Wide Web Conference (WWW 2019); arXiv:1905.05217. <https://doi.org/10.1145/3308558.3314139>  
   *Contribution:* A fast, scalable microscopic simulator for city-scale multi-agent RL, the default platform for most PressLight/CoLight/LLMLight-family studies.

18. **[lopez2018sumo]** Pablo Alvarez Lopez, Michael Behrisch, Laura Bieker-Walz, Jakob Erdmann, Yun-Pang Flötteröd, Robert Hilbrich, Leonhard Lücken, Johannes Rummel, Peter Wagner, Evamarie Wießner (2018). *Microscopic Traffic Simulation using SUMO*. 21st IEEE Int. Conf. on Intelligent Transportation Systems (ITSC 2018), pp. 2575-2582. <https://doi.org/10.1109/ITSC.2018.8569938>  
   *Contribution:* Reference description of the open-source SUMO microscopic simulator widely used for TSC, V2X and CAV studies.

19. **[alegre2019sumorl]** Lucas N. Alegre (2019). *SUMO-RL*. GitHub repository (software). <https://github.com/LucasAlegre/sumo-rl>  
   *Contribution:* Gymnasium/PettingZoo-compatible RL environments for traffic signal control on top of SUMO.

20. **[ault2021resco]** James Ault, Guni Sharon (2021). *Reinforcement Learning Benchmarks for Traffic Signal Control*. Proc. NeurIPS Track on Datasets and Benchmarks, Vol. 1 (2021). <https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/hash/f0935e4cd5920aa6c7c996a5ee53a70f-Abstract-round1.html>  
   *Contribution:* RESCO toolkit and realistic SUMO benchmark scenarios; finds earlier methods are brittle to changed sensing assumptions and irregular intersections.

21. **[mei2023libsignal]** Hao Mei, Xiaoliang Lei, Longchao Da, Bin Shi, Hua Wei (2023). *LibSignal: An Open Library for Traffic Signal Control*. Machine Learning (Springer), DOI 10.1007/s10994-023-06412-y; arXiv:2211.10649. <https://arxiv.org/abs/2211.10649>  
   *Contribution:* Open library benchmarking RL-TSC models across both SUMO and CityFlow with calibrated environments and shared protocols.

22. **[muller2021lemgorl]** Arthur Müller, Vishal Rangras, Georg Schnittker, Michael Waldmann, Maxim Friesen, Tobias Ferfers, Lukas Schreckenberg, Florian Hufen, Jürgen Jasperneite, Marco Wiering (2021). *Towards Real-World Deployment of Reinforcement Learning for Traffic Signal Control*. 20th IEEE Int. Conf. on Machine Learning and Applications (ICMLA 2021), DOI 10.1109/ICMLA52953.2021.00085; arXiv:2103.16223. <https://arxiv.org/abs/2103.16223>  
   *Contribution:* LemgoRL: a realistic benchmark of the German town of Lemgo with a signal-logic unit enforcing regulatory and safety constraints, aimed at deployable RL.


### 2.4 Max-pressure control

23. **[varaiya2013maxpressure]** Pravin Varaiya (2013). *Max pressure control of a network of signalized intersections*. Transportation Research Part C: Emerging Technologies (2013). <https://doi.org/10.1016/j.trc.2013.08.014>  
   *Contribution:* Introduces max-pressure control for signalized networks: a decentralized policy using only local queue information with a proven maximum-throughput (queue-stability) property.

24. **[levin2023mpreview]** Michael W. Levin (2023). *Max-Pressure Traffic Signal Timing: A Summary of Methodological and Experimental Results*. Journal of Transportation Engineering, Part A: Systems, 149(4). <https://ascelibrary.com/doi/10.1061/JTEPBS.TEENG-7578>  
   *Contribution:* State-of-the-art review of max-pressure variants (cycle-based, realistic flow models, measurement error, multimodal access) and their simulation and early field evidence.

25. **[stern2024mndot]** Raphael Stern, Michael W. Levin, Amir Kiani (2024). *Toward Implementation of Max-Pressure Control on Minnesota Roads: Phase 2*. Minnesota Department of Transportation, Report MN 2024-26. <https://rosap.ntl.bts.gov/view/dot/79015>  
   *Contribution:* Hardware-in-the-loop testbed running max-pressure on a Q-Free MaxTime controller, showing MP can be safely deployed on North American signal hardware.


### 2.5 Connected/automated vehicles, eco-driving, GLOSA and mixed autonomy

26. **[guo2019cavsurvey]** Qiangqiang Guo, Li Li, Xuegang (Jeff) Ban (2019). *Urban traffic signal control with connected and automated vehicles: A survey*. Transportation Research Part C: Emerging Technologies, 101, 313-334. <https://doi.org/10.1016/j.trc.2019.01.026>  
   *Contribution:* Surveys CAV-enabled state estimation and signal optimisation, groups CAV-based control into six types under a common framework and outlines research directions.

27. **[feng2015cvasc]** Yiheng Feng, K. Larry Head, Shayan Khoshmagham, Mehdi Zamanipour (2015). *A real-time adaptive signal control in a connected vehicle environment*. Transportation Research Part C: Emerging Technologies, 55, 460-473. <https://doi.org/10.1016/j.trc.2015.01.007>  
   *Contribution:* Two-level phase-sequence/duration optimisation from connected-vehicle data with estimation of unequipped vehicles; in VISSIM it cuts total delay up to 16.33% vs. actuated control at high penetration but is similar at low penetration.

28. **[jayawardana2022ecodriving]** Vindula Jayawardana, Cathy Wu (2022). *Learning Eco-Driving Strategies at Signalized Intersections*. arXiv preprint arXiv:2204.12561. <https://arxiv.org/abs/2204.12561>  
   *Contribution:* RL eco-driving for CAVs at signals: up to 18% fuel and 25% CO2 reduction at full penetration, with 25% penetration delivering at least half of the benefit.

29. **[lebre2015glosa]** Marie-Ange Lebre, Frédéric Le Mouël, Eric Ménard, Alexandre Garnault, Benazouz Bradaï, Vanessa Picron (2015). *Real scenario and simulations on GLOSA traffic light system for reduced CO2 emissions, waiting time and travel time*. arXiv preprint arXiv:1506.01965. <https://arxiv.org/abs/1506.01965>  
   *Contribution:* Evaluates Green Light Optimal Speed Advisory with real driving and simulation across V2I penetration rates, reporting reduced CO2, waiting and travel time.

30. **[yan2021mixedautonomy]** Zhongxia Yan, Cathy Wu (2021). *Reinforcement Learning for Mixed Autonomy Intersections*. IEEE Int. Intelligent Transportation Systems Conference (ITSC 2021), DOI 10.1109/ITSC48978.2021.9565000; arXiv:2111.04686. <https://arxiv.org/abs/2111.04686>  
   *Contribution:* Multi-agent RL controlling a fraction of vehicles at unsignalized intersections; learned policies behave like signals and reach near-optimal throughput with 33-50% controlled vehicles.

31. **[zhang2024rlcavsurvey]** Kaiwen Zhang, Zhiyong Cui, Wanjing Ma (2024). *A survey on reinforcement learning-based control for signalized intersections with connected automated vehicles*. Transport Reviews, 44(6), 1187-1208. <https://doi.org/10.1080/01441647.2024.2377637>  
   *Contribution:* Systematic review of RL for CV/CAV-data signal control, RL trajectory planning for CAVs and cooperative signal-CAV control, with a research roadmap.


### 2.6 Evidence on gaps (sim-to-real, safety, robustness, explainability, equity)

32. **[da2023ugat]** Longchao Da, Hao Mei, Romir Sharma, Hua Wei (2023). *Uncertainty-aware Grounded Action Transformation towards Sim-to-Real Transfer for Traffic Signal Control*. arXiv preprint arXiv:2307.12388. <https://arxiv.org/abs/2307.12388>  
   *Contribution:* UGAT applies grounded action transformation only when its uncertainty is low, narrowing the transition-dynamics gap between simulator and target environment for RL-TSC.

33. **[mei2023missingdata]** Hao Mei, Junxian Li, Bin Shi, Hua Wei (2023). *Reinforcement Learning Approaches for Traffic Signal Control under Missing Data*. Proc. 32nd Int. Joint Conf. on Artificial Intelligence (IJCAI 2023), DOI 10.24963/ijcai.2023/251. <https://arxiv.org/abs/2304.10722>  
   *Contribution:* Imputes missing states (and rewards) so RL controllers keep working at intersections without sensors, staying robust across missing-data rates.

34. **[du2023safelight]** Wenlu Du, Junyi Ye, Jingyi Gu, Jing Li, Hua Wei, Guiling Wang (2023). *SafeLight: A Reinforcement Learning Method toward Collision-free Traffic Signal Control*. Proc. AAAI Conference on Artificial Intelligence, 37(12), 14801-14810. <https://doi.org/10.1609/aaai.v37i12.26729>  
   *Contribution:* Safety-enhanced residual RL with multi-objective loss and reward shaping based on road-safety standards, significantly reducing collisions while improving mobility.

35. **[ault2020interpretable]** James Ault, Josiah P. Hanna, Guni Sharon (2020). *Learning an Interpretable Traffic Signal Control Policy*. arXiv preprint arXiv:1912.11023. <https://arxiv.org/abs/1912.11023>  
   *Contribution:* Learns regulatable polynomial (interpretable) signal policies via modified Deep Q-learning, reducing delay up to 19.4% vs. actuated control while remaining inspectable.

36. **[kwesiga2026robustness]** Dickens Kwesiga, Angshuman Guin, Khaled Abdelghany, Michael Hunter (2026). *Evaluating the Robustness of Reinforcement Learning based Adaptive Traffic Signal Control*. arXiv preprint arXiv:2603.15283. <https://arxiv.org/abs/2603.15283>  
   *Contribution:* RL controller with field-realistic eight-phase ring-barrier structure cuts delay 11-32% vs. optimised actuated control but degrades under substantially different O-D demand unless trained on diverse patterns.

37. **[rafi2026sim2signal]** Ferdous Al Rafi, Susrik Mukherjee, Latika Liladhar Dekate, Jennifer Yawa Lavoe, Huaiyuan Yao, Shlok Mohanty, Longchao Da, Xuesong Zhou, Hua Wei (2026). *Sim2Signal: Sim-to-Real Benchmarks for Traffic Signal Control*. arXiv preprint arXiv:2609.01676. <https://arxiv.org/abs/2609.01676>  
   *Contribution:* Decomposes the sim-to-real gap into observation, action, transition and reward gaps and tests 18 mitigation methods over 33 gap settings and 10 calibrated networks; direct transfer always degrades and no mitigation wins everywhere.

38. **[zhang2026equity]** Xiaocai Zhang, Neema Nassir, Lok Sang Chan, Milad Haghani (2026). *Human-Centric Traffic Signal Control for Equity: A Multi-Agent Action Branching Deep Reinforcement Learning Approach*. arXiv preprint arXiv:2602.02959. <https://arxiv.org/abs/2602.02959>  
   *Contribution:* MA2B-DDQN rewards minimising the number of delayed people (pedestrians, occupants, transit riders) on a Melbourne corridor, shifting TSC objectives from vehicles to travellers.


### 2.7 Surveys and future-direction papers

39. **[nie2025llm4tr]** Tong Nie, Jian Sun, Wei Ma (2025). *Exploring the Roles of Large Language Models in Reshaping Transportation Systems: A Survey, Framework, and Roadmap*. Elsevier journal article, DOI 10.1016/j.ait.2025.100003; arXiv:2503.21411. <https://arxiv.org/abs/2503.21411>  
   *Contribution:* LLM4TR framework classifying LLM roles in transportation as information processors, knowledge encoders, component generators and decision facilitators, with a research roadmap.

40. **[karim2025llmsafety]** Muhammad Monjurul Karim, Yan Shi, Shucheng Zhang, Bingzhang Wang, Mehrdad Nasri, Yinhai Wang (2025). *Large Language Models and Their Applications in Roadway Safety and Mobility Enhancement: A Comprehensive Review*. Elsevier journal article, DOI 10.1016/j.ait.2025.100004; arXiv:2506.06301. <https://arxiv.org/abs/2506.06301>  
   *Contribution:* Reviews LLM adaptation for mobility (including signal control) and safety, V2X/edge enablers, and names hallucination, reasoning deficits, data governance and safety assurance as key challenges.


## 3. Gap table

| Gap | Why it matters | Representative evidence | Promising solution directions |
|---|---|---|---|
| Sim-to-real transfer and field deployment | Almost all RL and LLM controllers are tested only in CityFlow or SUMO. A policy that fails in the field causes real delay and safety risk. | Direct transfer degrades performance under every gap type tested [rafi2026sim2signal]. RL controllers degrade when demand differs from training [kwesiga2026robustness]. Field-adjacent max-pressure work stops at hardware-in-the-loop [stern2024mndot]. | Grounded action transformation [da2023ugat]. LLM-informed dynamics grounding [da2024promptgat]. Estimating the gap rather than randomising over it [rafi2026sim2signal]. Realistic benchmarks with signal-logic units [muller2021lemgorl; ault2021resco]. Hardware-in-the-loop staging [stern2024mndot]. |
| Safety and guardrails | Signal controllers are safety-critical: phase constraints, minimum greens and conflict avoidance are non-negotiable. | Enforcing road-safety standards in RL significantly reduces collisions relative to baselines [du2023safelight]. LemgoRL embeds a regulatory signal-logic unit [muller2021lemgorl]. | Residual or shielded RL [du2023safelight]. Rule-enforcing logic layers [muller2021lemgorl]. LLM meta-controllers that check rule compliance and route only critical cases to slow reasoning [wang2025vlmlight]. |
| Hallucination in LLM controllers | An LLM can output an invalid phase or a confident but wrong rationale, and its latency is unbounded. | LLM surveys list hallucination and reasoning deficits as key barriers [karim2025llmsafety; nie2025llm4tr]. HeraldLight adds a dedicated critic to catch hallucinations [guo2025heraldlight]. | Actor-critic LLM pairs [guo2025heraldlight]. LLM as auditor over an RL or max-pressure base policy rather than sole controller [pang2024illmtsc; wang2025vlmlight]. Domain fine-tuning [lai2025llmlight; yuan2026collmlight]. Action masking to legal phases. |
| Explainability | Operators and regulators need to understand why a phase was chosen before approving a controller. | Interpretable polynomial policies are competitive with deep networks [ault2020interpretable]. LLMLight's rationales were scored by 15 human experts [lai2025llmlight]. | Interpretable function classes [ault2020interpretable]. Natural-language rationales checked for faithfulness to the actual control logic (open problem). |
| Robustness to sensor faults and communication delay | Detectors fail and V2X links drop packets. Most benchmarks assume perfect observation. | Prior RL methods are brittle to changed sensing assumptions [ault2021resco]. LA-Light reports a 20.4% gain under sensor outage [wang2024lalight]. iLLM-TSC reports a 17.5% gain under degraded communication [pang2024illmtsc]. | Imputation of missing states and rewards [mei2023missingdata]. LLM correction of RL actions [pang2024illmtsc]. Training on diverse demand [kwesiga2026robustness]. |
| Scalability | Real cities have thousands of signals. LLM inference per intersection per step is expensive. | MPLight was demonstrated on 2,510 signals [chen2020mplight]. CoLLMLight targets network-wide LLM control with complexity-aware reasoning [yuan2026collmlight]. | Parameter sharing and decentralisation [chen2020mplight]. Universal policies [oroojlooy2020attendlight]. Lightweight fine-tuned LLMs and adaptive reasoning depth [yuan2026collmlight]. |
| Computational latency | Signal decisions run on seconds-level cycles, and multi-step LLM reasoning may not meet them. | VLMLight keeps normal-condition degradation below 1% by sending only critical cases to the slow reasoning branch [wang2025vlmlight]. | Fast/slow dual-path control [wang2025vlmlight]. Distilled domain models [lai2025llmlight]. |
| Fairness and equity | Throughput-optimal control can starve minor movements, pedestrians and transit users. | Person-delay-based rewards that include pedestrians and transit [zhang2026equity]. Max-pressure variants that add multimodal access [levin2023mpreview]. | People-centric rewards [zhang2026equity]. Constrained or multi-objective RL. Formal maximum-wait bounds. |
| Data and benchmark limitations | Results rest on a few datasets (Jinan, Hangzhou, New York) and on simulator-specific settings, which makes comparison and reproduction hard. | Calibrated cross-simulator library [mei2023libsignal]. Realistic scenario benchmarks [ault2021resco; muller2021lemgorl]. Sim-to-real benchmark [rafi2026sim2signal]. | Shared protocols across SUMO and CityFlow [mei2023libsignal]. Gap-decomposed benchmarks [rafi2026sim2signal]. Field-realistic ring-barrier phasing [kwesiga2026robustness]. |
| Mixed autonomy and V2X dependence | Benefits depend on CV/CAV penetration, and low-penetration performance often matches the status quo. | CV-based adaptive control gains at high penetration but performs about the same as actuated control at low penetration [feng2015cvasc]. 25% CAV penetration yields at least half of the eco-driving benefit [jayawardana2022ecodriving]. | Estimating unequipped vehicles [feng2015cvasc]. Joint signal-CAV control [zhang2024rlcavsurvey; guo2019cavsurvey]. Partial-control MARL [yan2021mixedautonomy]. GLOSA [lebre2015glosa]. |
| Human factors and regulation | Advice compliance, operator trust and certification of learning-based controllers decide whether anything gets deployed. | Little direct TSC-specific evidence was verified. LemgoRL encodes regulatory constraints [muller2021lemgorl], and the LLM surveys flag deployment and safety assurance [karim2025llmsafety]. | Human-in-the-loop operator interfaces via conversational agents [zhang2024trafficgpt; da2024openti]. Certification-oriented logic layers. This area is under-researched (see §4). |

## 4. Open research questions for MSc/PhD projects

1. **Verified LLM supervision.** Can an LLM supervisor over a max-pressure or RL base controller (in the style of iLLM-TSC or VLMLight) be given a formal guarantee, such as never violating minimum green or exceeding a maximum pedestrian wait, while keeping its gains in rare events? What is the measured cost in latency and throughput?
2. **Faithful explanations.** How often do LLM controller rationales (LLMLight, LA-Light) match the features that actually drove the decision? Can a faithfulness metric for traffic explanations be defined and validated with traffic engineers?
3. **Which sim-to-real gap dominates?** Using Sim2Signal's four-way decomposition, which gap (observation, action, transition or reward) dominates for LLM controllers compared with RL controllers? Does LLM world knowledge, as in PromptGAT, reduce the transition gap more than grounded action transformation (UGAT)?
4. **Robustness under realistic faults.** How do LLM, RL and max-pressure controllers degrade under combined detector outages, V2X latency and packet loss, and adversarial or noisy prompts? Can a single stress-test protocol be built on LibSignal or RESCO?
5. **Scalable agentic coordination.** What is the best division of labour between cheap local policies and expensive LLM reasoning across a city-scale network (CoLLMLight, MPLight scale)? Can a learned router decide when to escalate to an LLM under a fixed compute budget?
6. **Equity-aware agentic control.** Can people-centric objectives (pedestrians, transit, cyclists) be specified in natural language by operators and compiled safely into rewards or constraints? Who wins and who loses relative to throughput-optimal control?
7. **Mixed-autonomy signal and vehicle co-control at low penetration.** Below roughly 25% CAV/CV penetration, can joint signal control and eco-driving/GLOSA beat actuated control, given the weak low-penetration results reported by Feng et al. (2015)?
8. **Path to certification.** What evidence (hardware-in-the-loop, shadow-mode field trials, failure-mode analysis) would a road authority need to approve a learning-based or LLM-based controller? The MnDOT max-pressure process could serve as a template.

## 5. Verification notes: what could not be verified or was left out

- **Varaiya (2013)**: title, journal (*Transportation Research Part C*) and year are confirmed via Varaiya's Berkeley publication list. The DOI resolves to a TR-C article (PII S0968090X13001782). Volume and page numbers could not be confirmed from a fetched page, so they are omitted.
- **Venues not confirmed** (cited as arXiv preprints): LA-Light, iLLM-TSC, HeraldLight, UGAT, Advanced-XLight and Efficient-XLight, Learning an Interpretable TSC Policy (Ault et al.), Jayawardana and Wu eco-driving, the GLOSA study (Lebre et al.), Sim2Signal, Kwesiga et al., Zhang et al. (equity). Some of these may have since been published in peer-reviewed venues.
- **Partly confirmed venues**: Open-TI, Nie et al. and Karim et al. are cited by the DOI shown on their arXiv pages. The journal name was not displayed. Open-TI's DOI prefix corresponds to a Springer journal, and the other two have Elsevier DOIs. LibSignal's DOI (10.1007/s10994-…) is the Springer *Machine Learning* journal series. The 2023 year is inferred from the DOI and not shown on the page.
- **Simulator and dataset details**: for LLMLight, LA-Light, CoLLMLight, PromptGAT and Open-TI, the abstracts do not name the simulator or datasets. The brief therefore does not state them. Quantitative results are given only where the abstract states them.
- **Topics with no verified source included**: SPaT/MAP message standards (e.g., SAE J2735) and V2X communication-delay studies specific to signal control; human-factors studies of driver compliance with signal advisories; regulatory or certification frameworks for AI-based signal controllers; LLM-specific latency benchmarks for TSC. These were searched briefly but nothing was verified, so they are listed as gaps rather than cited.
- **Verified but left out to stay within 40 entries**: Kouvelas et al. 2014 (TRR 2421:133-141, max-pressure on arterials); Gregoire et al., capacity-aware back-pressure (arXiv:1309.6484); Dresner and Stone 2008 (JAIR 31:591-656, autonomous intersection management); Wu et al., Flow (arXiv:1710.05465); Wei et al., A Survey on Traffic Signal Control Methods (arXiv:1904.08117); Haydari and Yilmaz, DRL for ITS survey (arXiv:2005.00935); Raeis and Leon-Garcia, fair DRL TSC (arXiv:2107.10146); CityLight (arXiv:2406.02126); Transit-MP (arXiv:2511.00309); distributionally robust MARL TSC (arXiv:2512.18558); MARL variable-speed-limit field deployment on I-24 (arXiv:2407.08021, not TSC but the closest field-deployed MARL evidence found).
