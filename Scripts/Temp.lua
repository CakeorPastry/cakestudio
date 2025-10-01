--[[ =========================================================
🔥 MEGA SCRIPT: Base Alerts + Animal Scanner + Float Platform + Anti-Ragdoll
Place in: StarterPlayerScripts
========================================================= ]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local UserInputService = game:GetService("UserInputService")

local LocalPlayer = Players.LocalPlayer
local player = LocalPlayer

-- =========================================================
-- ========== 📢 NOTIFICATION SYSTEM =======================
-- =========================================================
local function createNotificationUI()
	local gui = Instance.new("ScreenGui")
	gui.Name = "NotificationGui"
	gui.ResetOnSpawn = false
	gui.Parent = LocalPlayer:WaitForChild("PlayerGui")

	local frame = Instance.new("Frame")
	frame.Name = "List"
	frame.Size = UDim2.new(0, 300, 1, 0)
	frame.Position = UDim2.new(1, -310, 0, 100)
	frame.BackgroundTransparency = 1
	frame.AutomaticSize = Enum.AutomaticSize.Y
	frame.ClipsDescendants = false
	frame.Parent = gui

	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Padding = UDim.new(0, 5)
	layout.Parent = frame

	return frame
end

local NotificationFrame = createNotificationUI()
local notifyCooldowns = {}

local function canNotify(id, cooldown)
	local last = notifyCooldowns[id]
	if not last or tick() - last >= cooldown then
		notifyCooldowns[id] = tick()
		return true
	end
	return false
end

local function notify(message, type)
	local colors = {
		default = Color3.fromRGB(255, 255, 255),
		success = Color3.fromRGB(0, 255, 0),
		warning = Color3.fromRGB(255, 255, 0),
		danger = Color3.fromRGB(255, 0, 0),
	}

	local textLabel = Instance.new("TextLabel")
	textLabel.Size = UDim2.new(1, 0, 0, 30)
	textLabel.BackgroundTransparency = 0.3
	textLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	textLabel.TextColor3 = colors[type] or colors.default
	textLabel.Text = message
	textLabel.Font = Enum.Font.SourceSansBold
	textLabel.TextSize = 18
	textLabel.Parent = NotificationFrame

	delay(5, function()
		if textLabel then
			textLabel:Destroy()
		end
	end)
end

-- =========================================================
-- ========== 🏠 BASE DETECTION + COUNTDOWN =================
-- =========================================================
local function findBaseModel()
	local plotsFolder = Workspace:WaitForChild("Plots")
	local targetText = LocalPlayer.Name .. "'s Base"

	for _, descendant in ipairs(plotsFolder:GetDescendants()) do
		if descendant:IsA("TextLabel") and descendant.Text == targetText then
			local current = descendant
			while current and current.Parent ~= plotsFolder do
				current = current.Parent
			end
			local baseModel = current
			if baseModel and baseModel:IsA("Model") and baseModel.Parent == plotsFolder then
				notify("✅ Found your base!", "success")
				local purchases = baseModel:FindFirstChild("Purchases")
				local plotBlock = purchases and purchases:FindFirstChild("PlotBlock")
				local countdownLabel = nil

				if plotBlock then
					local main = plotBlock:FindFirstChild("Main") or plotBlock
					if main then
						local gui = main:FindFirstChildOfClass("BillboardGui")
						if gui then
							countdownLabel = gui:FindFirstChild("RemainingTime")
						end
					end
				end

				return baseModel, plotBlock, countdownLabel
			end
		end
	end

	notify("❌ Could not find your base!", "danger")
	return nil, nil, nil
end

local BaseModel, PlotModel, CountdownLabel = findBaseModel()
if not BaseModel then
	warn("Base not found, continuing...")
end

-- Countdown Display GUI
local function createCountdownDisplay()
	local gui = Instance.new("ScreenGui")
	gui.Name = "CountdownDisplayGui"
	gui.ResetOnSpawn = false
	gui.Parent = LocalPlayer:WaitForChild("PlayerGui")

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(0, 200, 0, 30)
	label.Position = UDim2.new(0, 10, 1, -40)
	label.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	label.BackgroundTransparency = 0.4
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.Font = Enum.Font.SourceSansBold
	label.TextSize = 18
	label.Text = "Base Timer: N/A"
	label.Name = "CountdownLabel"
	label.Parent = gui

	return label
end
local CountdownDisplayLabel = createCountdownDisplay()
local lastCountdownText = ""

-- Billboard + highlight helpers
local function addHighlight(char, name, color)
	if not char or not char:IsDescendantOf(Workspace) then
		return
	end
	if char:FindFirstChild(name) then
		return
	end
	local highlight = Instance.new("Highlight")
	highlight.Name = name
	highlight.FillColor = color
	highlight.OutlineColor = Color3.new(0, 0, 0)
	highlight.OutlineTransparency = 0
	highlight.Parent = char
end

local function removeHighlight(char, name)
	local h = char and char:FindFirstChild(name)
	if h then
		h:Destroy()
	end
end

local function addBillboard(player, text, color, name)
	local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
	if not root then
		return
	end
	local billboard = root:FindFirstChild("StackedBillboard")
	if not billboard then
		billboard = Instance.new("BillboardGui")
		billboard.Name = "StackedBillboard"
		billboard.Size = UDim2.new(0, 150, 0, 100)
		billboard.StudsOffset = Vector3.new(0, 4, 0)
		billboard.AlwaysOnTop = true
		billboard.Adornee = root
		billboard.Parent = root

		local layout = Instance.new("UIListLayout")
		layout.SortOrder = Enum.SortOrder.LayoutOrder
		layout.Padding = UDim.new(0, 2)
		layout.Parent = billboard
	end
	if billboard:FindFirstChild(name) then
		return
	end
	local label = Instance.new("TextLabel")
	label.Name = name
	label.Size = UDim2.new(1, 0, 0, 20)
	label.BackgroundTransparency = 1
	label.Text = text
	label.TextColor3 = color
	label.TextScaled = true
	label.Font = Enum.Font.SourceSansBold
	label.Parent = billboard
end

local function removeBillboard(player, name)
	local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
	if not root then
		return
	end
	local billboard = root:FindFirstChild("StackedBillboard")
	if billboard then
		local label = billboard:FindFirstChild(name)
		if label then
			label:Destroy()
		end
		if #billboard:GetChildren() <= 1 then
			billboard:Destroy()
		end
	end
end

-- =========================================================
-- ========== 🐾 ANIMAL PODIUM SCANNER =====================
-- =========================================================
local function parsePrice(text)
	text = string.lower(text)
	local number = tonumber(text:match("[%d%.]+")) or 0
	if text:find("k") then
		return number * 1_000
	elseif text:find("m") then
		return number * 1_000_000
	elseif text:find("b") then
		return number * 1_000_000_000
	end
	return number
end

local function clearVisualsFromInstance(inst)
	local billboard = inst:FindFirstChild("AnimalInfoBillboard")
	if billboard then
		billboard:Destroy()
	end
	local highlight = inst:FindFirstChild("AnimalHighlight")
	if highlight then
		highlight:Destroy()
	end
end

local function createBillboard(target, displayName, genText, priceText)
	clearVisualsFromInstance(target)
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "AnimalInfoBillboard"
	billboard.Size = UDim2.new(0, 150, 0, 100)
	billboard.StudsOffset = Vector3.new(0, 3, 0)
	billboard.AlwaysOnTop = true
	billboard.Adornee = target
	billboard.Parent = target

	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Padding = UDim.new(0, 2)
	layout.Parent = billboard

	local function addLabel(text)
		local label = Instance.new("TextLabel")
		label.Size = UDim2.new(1, 0, 0, 20)
		label.BackgroundTransparency = 1
		label.Text = string.lower(text)
		label.TextColor3 = Color3.new(1, 1, 1)
		label.TextScaled = true
		label.Font = Enum.Font.SourceSansBold
		label.Parent = billboard
	end

	addLabel(displayName)
	addLabel(genText)
	addLabel(priceText)
end

local function createHighlight(target)
	clearVisualsFromInstance(target)
	local highlight = Instance.new("Highlight")
	highlight.Name = "AnimalHighlight"
	highlight.FillColor = Color3.fromRGB(255, 215, 0)
	highlight.OutlineColor = Color3.new(0, 0, 0)
	highlight.OutlineTransparency = 0
	highlight.Parent = target
end

local function findTopAnimals()
	local plots = Workspace:FindFirstChild("Plots")
	if not plots then
		return
	end
	local allAnimals = {}
	for _, plot in ipairs(plots:GetChildren()) do
		local animalPodiums = plot:FindFirstChild("AnimalPodiums")
		if animalPodiums then
			for _, podium in ipairs(animalPodiums:GetChildren()) do
				local overhead = podium:FindFirstChild("Base")
					and podium.Base:FindFirstChild("Spawn")
					and podium.Base.Spawn:FindFirstChild("Attachment")
					and podium.Base.Spawn.Attachment:FindFirstChild("AnimalOverhead")
				if overhead then
					local display = overhead:FindFirstChild("DisplayName")
					local gen = overhead:FindFirstChild("Generation")
					local price = overhead:FindFirstChild("Price")
					if display and gen and price then
						table.insert(allAnimals, {
							podium = podium,
							displayName = display.Text,
							generation = gen.Text,
							priceText = price.Text,
							priceValue = parsePrice(price.Text),
						})
					end
				end
			end
		end
	end
	table.sort(allAnimals, function(a, b)
		return a.priceValue > b.priceValue
	end)
	return allAnimals
end

task.spawn(function()
	while true do
		for _, plot in ipairs(Workspace.Plots:GetChildren()) do
			local animalPodiums = plot:FindFirstChild("AnimalPodiums")
			if animalPodiums then
				for _, podium in ipairs(animalPodiums:GetChildren()) do
					clearVisualsFromInstance(podium)
				end
			end
		end
		local topAnimals = findTopAnimals()
		for i = 1, math.min(3, #topAnimals) do
			local data = topAnimals[i]
			createHighlight(data.podium)
			createBillboard(data.podium, data.displayName, data.generation, data.priceText)
		end
		task.wait(10)
	end
end)

-- =========================================================
-- ========== 🪂 FLOAT PLATFORM + UI =======================
-- =========================================================
local FLOAT_NAME = "PlayerFloatPlatform" .. tostring(math.random(1000, 9999))
local PLATFORM_SIZE = Vector3.new(2, 0.2, 1.5)
local PLATFORM_TRANSPARENCY = 1
local PLATFORM_COLLISION = true
local INITIAL_OFFSET = -3.1

local floatPart = nil
local floatOffset = INITIAL_OFFSET
local floating = false

local heartbeatConn
local humanoidDiedConn

local function safeDisconnect(conn)
	if conn and conn.Disconnect then
		conn:Disconnect()
	end
end
local function getRootPart(character)
	if not character then
		return nil
	end
	return character:FindFirstChild("HumanoidRootPart") or character:FindFirstChild("Torso")
end
local function createPlatform(parent)
	local p = Instance.new("Part")
	p.Name = FLOAT_NAME
	p.Size = PLATFORM_SIZE
	p.Transparency = PLATFORM_TRANSPARENCY
	p.Anchored = true
	p.CanCollide = PLATFORM_COLLISION
	p.Parent = parent
	return p
end
local function destroyPlatform()
	if floatPart then
		floatPart:Destroy()
		floatPart = nil
	end
end
local function stopFloating()
	floating = false
	safeDisconnect(heartbeatConn)
	safeDisconnect(humanoidDiedConn)
	destroyPlatform()
end
local function startFloating()
	if floating then
		return
	end
	local char = player.Character
	if not char then
		return
	end
	local root = getRootPart(char)
	if not root then
		return
	end
	floatPart = createPlatform(workspace)
	floatPart.CFrame = root.CFrame * CFrame.new(0, floatOffset, 0)
	local humanoid = char:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoidDiedConn = humanoid.Died:Connect(stopFloating)
	end
	heartbeatConn = RunService.Heartbeat:Connect(function()
		local currentChar = player.Character
		local currentRoot = getRootPart(currentChar)
		if not currentChar or not currentRoot or not floatPart or not floatPart.Parent then
			stopFloating()
			return
		end
		floatPart.CFrame = currentRoot.CFrame * CFrame.new(0, floatOffset, 0)
	end)
	floating = true
end
local function increaseOffset(amount)
	floatOffset += amount
end
local function decreaseOffset(amount)
	floatOffset -= amount
end

-- =========================================================
-- ========== 🚫 ANTI-RAGDOLL ==============================
-- =========================================================
local PlayerModule = require(player:WaitForChild("PlayerScripts"):WaitForChild("PlayerModule"))
local Controls = PlayerModule:GetControls()
local humanoid = nil
local antiRagdollEnabled = true

local function setupAntiRagdoll()
	humanoid = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		return
	end
	humanoid.StateChanged:Connect(function(old, new)
		if antiRagdollEnabled and new == Enum.HumanoidStateType.Physics then
			Controls:Enable()
			humanoid:ChangeState(Enum.HumanoidStateType.Running)
		end
	end)
end
if player.Character then
	setupAntiRagdoll()
end
player.CharacterAdded:Connect(function()
	setupAntiRagdoll()
	stopFloating()
end)

-- =========================================================
-- ========== 🧰 FLOAT UI + ANTI-RAGDOLL TOGGLE ============
-- =========================================================
local function createUI()
	local playerGui = player:WaitForChild("PlayerGui")
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "FloatUI"
	screenGui.ResetOnSpawn = false
	screenGui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(0, 150, 0, 230)
	frame.Position = UDim2.new(0, 670, 0, -51)
	frame.BackgroundTransparency = 0.3
	frame.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
	frame.Active = true
	frame.Draggable = true
	frame.Parent = screenGui

	local function makeButton(name, text, order)
		local btn = Instance.new("TextButton")
		btn.Name = name
		btn.Text = text
		btn.Font = Enum.Font.SourceSansBold
		btn.TextSize = 20
		btn.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
		btn.TextColor3 = Color3.new(1, 1, 1)
		btn.Size = UDim2.new(1, -10, 0, 40)
		btn.Position = UDim2.new(0, 5, 0, 10 + (order * 45))
		btn.BorderSizePixel = 0
		btn.AutoButtonColor = true
		btn.Parent = frame
		return btn
	end

	local btnEnable = makeButton("EnableBtn", "Enable Float", 0)
	local btnDisable = makeButton("DisableBtn", "Disable Float", 1)
	local btnUp = makeButton("UpBtn", "Up (+)", 2)
	local btnDown = makeButton("DownBtn", "Down (-)", 3)
	local btnAnti = makeButton("AntiBtn", "Anti-Ragdoll: ON", 4)

	btnEnable.MouseButton1Click:Connect(startFloating)
	btnDisable.MouseButton1Click:Connect(stopFloating)
	btnUp.MouseButton1Click:Connect(function()
		increaseOffset(0.5)
	end)
	btnDown.MouseButton1Click:Connect(function()
		decreaseOffset(0.5)
	end)

	btnAnti.MouseButton1Click:Connect(function()
		antiRagdollEnabled = not antiRagdollEnabled
		btnAnti.Text = "Anti-Ragdoll: " .. (antiRagdollEnabled and "ON" or "OFF")
	end)
end
createUI()

-- =========================================================
-- ========== 🔁 MAIN HEARTBEAT LOOP =======================
-- =========================================================
RunService.Heartbeat:Connect(function()
	-- === Base countdown refresh ===
	if not CountdownLabel or not CountdownLabel:IsDescendantOf(game) then
		BaseModel, PlotModel, CountdownLabel = findBaseModel()
		lastCountdownText = ""
	end

	local currentText = CountdownLabel and CountdownLabel:IsA("TextLabel") and CountdownLabel.Text or ""
	if currentText ~= "" then
		CountdownDisplayLabel.Text = "Base Timer: " .. currentText
		if currentText == "1s" and lastCountdownText ~= "1s" then
			notify("🔓 Your base is unlocked! Go lock it!", "danger")
		end
		lastCountdownText = currentText
	else
		CountdownDisplayLabel.Text = "Base Timer: N/A"
		lastCountdownText = ""
	end

	-- === Proximity detection ===
	local hitbox = PlotModel and PlotModel:FindFirstChild("Hitbox")
	local basePos = hitbox and hitbox.Position or Vector3.new(0, 0, 0)

	for _, plr in ipairs(Players:GetPlayers()) do
		if plr == LocalPlayer then
			continue
		end

		local char = plr.Character
		local hrp = char and char:FindFirstChild("HumanoidRootPart")
		if not hrp then
			continue
		end

		local distToBase = (hrp.Position - basePos).Magnitude

		if distToBase < 50 then
			if canNotify(plr.Name .. "_near", 5) then
				notify("⚠️ " .. plr.Name .. " is near your base!", "warning")
			end
			addBillboard(plr, "NEAR BASE", Color3.fromRGB(255, 255, 0), "NearBase")
			addHighlight(char, "NearBaseHighlight", Color3.fromRGB(255, 255, 0))
		else
			removeBillboard(plr, "NearBase")
			removeHighlight(char, "NearBaseHighlight")
		end

		if distToBase < 25 then
			if canNotify(plr.Name .. "_danger", 5) then
				notify("🚨 " .. plr.Name .. " is at your base core!", "danger")
			end
			addBillboard(plr, "DANGER", Color3.fromRGB(255, 0, 0), "Danger")
			addHighlight(char, "DangerHighlight", Color3.fromRGB(255, 0, 0))
		else
			removeBillboard(plr, "Danger")
			removeHighlight(char, "DangerHighlight")
		end

		-- === Invisibility detection ===
		local invisiblePartCount = 0
		local totalParts = 0
		for _, part in ipairs(char:GetDescendants()) do
			if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
				totalParts += 1
				if part.Transparency == 1 then
					invisiblePartCount += 1
				end
			end
		end

		local isInvisible = (totalParts > 0 and invisiblePartCount / totalParts > 0.7)
		if isInvisible then
			for _, part in ipairs(char:GetDescendants()) do
				if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" and part.Transparency == 1 then
					part.Transparency = 0.5
				end
			end
			addBillboard(plr, "INVISIBLE", Color3.fromRGB(255, 0, 0), "Invisible")
			addHighlight(char, "InvisibleHighlight", Color3.fromRGB(255, 0, 0))
		else
			removeBillboard(plr, "Invisible")
			removeHighlight(char, "InvisibleHighlight")
		end
	end
end)
